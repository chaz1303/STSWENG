import { fileURLToPath } from 'node:url';
import express from 'express';
import {
  hashPassword,
  signToken,
  validateLogin,
  validateRegister,
  verifyPassword,
  verifyToken,
} from '../services/auth.js';
import { CANCELLABLE, validateBooking } from '../services/bookings.js';
import { BOOKING_STATES } from '../utils/contract.js';
import { getDb } from './db.js';
import { pgStore } from './store.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PROTOTYPE_DIR = fileURLToPath(new URL('../web', import.meta.url));
// Compared against when the account doesn't exist, so a wrong number takes as long as a wrong password.
const DUMMY_HASH = hashPassword('no such resident');
const TOO_MANY = 'Too many attempts. Please wait a few minutes and try again.';

const fail = (res, status, code, message, fields) =>
  res.status(status).json({ error: { code, message, ...(fields && { fields }) } });
const publicResident = (r) => ({
  id: r.id,
  email: r.email,
  mobile_number: r.mobile_number,
  full_name: r.full_name,
  is_verified_email: Boolean(r.is_verified_email),
  is_verified_number: Boolean(r.is_verified_number),
});
function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters');
  return s;
}

// Fixed-window counter per key (open item 18). Used per IP for the sign-in routes, and per account
// for wrong passwords, so guessing one account's password is slow even from many addresses.
// shortcut: counts in memory, so it resets on restart and isn't shared between instances. Move it to
// the database or the host's limiter when the app runs on more than one instance.
function counter(max, windowMs) {
  const hits = new Map();
  return {
    // Seconds left in the window once `max` is reached, else 0.
    wait(key) {
      const h = hits.get(key),
        now = Date.now();
      return h && h.reset > now && h.n >= max ? Math.ceil((h.reset - now) / 1000) : 0;
    },
    add(key) {
      const now = Date.now();
      if (hits.size > 5000) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
      const h = hits.get(key);
      if (!h || h.reset <= now) hits.set(key, { n: 1, reset: now + windowMs });
      else h.n++;
    },
    clear: (key) => hits.delete(key),
  };
}
const tooMany = (res, seconds) => {
  res.set('Retry-After', String(seconds));
  return fail(res, 429, 'TOO_MANY_REQUESTS', TOO_MANY);
};

// `store` and `secret` can be replaced in tests. The default store reaches the database lazily, so
// routes that don't need it (health, the static prototype) work without DATABASE_URL.
export function createApp({
  store = pgStore(getDb),
  secret = jwtSecret,
  authLimit = 30,
  loginFailLimit = 5,
} = {}) {
  const app = express();
  app.set('trust proxy', 1); // one proxy in front on the host, so req.ip is the client's address
  app.disable('x-powered-by');
  // The login token sits in localStorage, so the CSP is what stops an injected script from reading it.
  // 'unsafe-inline' for styles only: the prototype renders style="" attributes.
  app.use((req, res, next) => {
    res.set({
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; " +
        "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
        "manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
      'Strict-Transport-Security': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    });
    next();
  });
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  // Says whether the database answers. On failure it gives the driver's error code only (for example
  // ENETUNREACH or 28P01), never the message, which can hold the host name.
  app.get('/api/health/db', async (req, res) => {
    try {
      await store.ping();
      res.json({ status: 'ok' });
    } catch (e) {
      res
        .status(503)
        .json({ status: 'down', code: String(e.code ?? e.name ?? 'UNKNOWN').slice(0, 40) });
    }
  });

  const auth = express.Router();
  const perIp = counter(authLimit, 10 * 60 * 1000);
  // 5 wrong passwords for one email or number lock it for 15 minutes. Unknown accounts count the same
  // way, so the lock doesn't reveal which accounts exist.
  const perAccount = counter(loginFailLimit, 15 * 60 * 1000);
  auth.use((req, res, next) => {
    const wait = perIp.wait(req.ip);
    if (wait) return tooMany(res, wait);
    perIp.add(req.ip);
    next();
  });
  auth.post('/register', async (req, res) => {
    const { value, fields } = validateRegister(req.body);
    if (fields)
      return fail(res, 400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', fields);
    const { password, ...rest } = value;
    try {
      // shortcut: no email or SMS service yet (open items 15, 24), so new accounts are marked verified
      // on both. Set these to false once the verification links and codes are sent.
      const resident = await store.createResident({
        ...rest,
        password_hash: await hashPassword(password),
        is_verified_email: true,
        is_verified_number: true,
      });
      res
        .status(201)
        .json({ token: signToken(resident.id, secret()), resident: publicResident(resident) });
    } catch (e) {
      if (e.taken === 'email')
        return fail(res, 409, 'EMAIL_TAKEN', 'An account with this email address already exists.');
      if (e.taken === 'mobile_number')
        return fail(res, 409, 'MOBILE_TAKEN', 'An account with this mobile number already exists.');
      throw e;
    }
  });
  auth.post('/login', async (req, res) => {
    const { value, fields } = validateLogin(req.body);
    if (fields)
      return fail(res, 400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', fields);
    const account = value.email ?? value.mobile_number;
    const wait = perAccount.wait(account);
    if (wait) return tooMany(res, wait);
    const resident = await store.findResidentForLogin(value);
    const ok = await verifyPassword(
      value.password,
      resident ? resident.password_hash : await DUMMY_HASH,
    );
    if (ok) perAccount.clear(account);
    else perAccount.add(account);
    if (!resident || !ok)
      return fail(
        res,
        401,
        'INVALID_CREDENTIALS',
        `Incorrect ${value.email ? 'email' : 'mobile number'} or password. Please try again.`,
      );
    res.json({ token: signToken(resident.id, secret()), resident: publicResident(resident) });
  });
  app.use('/api/auth', auth);

  // Everything below needs a valid access token.
  const requireResident = (req, res, next) => {
    const [scheme, token] = String(req.get('authorization') ?? '').split(' ');
    const payload = scheme === 'Bearer' && token ? verifyToken(token, secret()) : null;
    if (!payload) return fail(res, 401, 'UNAUTHENTICATED', 'Please log in again.');
    req.residentId = payload.sub;
    next();
  };

  app.get('/api/me', requireResident, async (req, res) => {
    const resident = await store.findResident(req.residentId);
    if (!resident) return fail(res, 401, 'UNAUTHENTICATED', 'Please log in again.');
    res.json({ resident: publicResident(resident) });
  });
  app.post('/api/bookings', requireResident, async (req, res) => {
    const { value, fields } = validateBooking(req.body);
    if (fields)
      return fail(res, 400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', fields);
    res.status(201).json({ booking: await store.createBooking(req.residentId, value) });
  });
  app.get('/api/bookings', requireResident, async (req, res) => {
    res.json({ bookings: await store.listBookings(req.residentId) });
  });
  app.patch('/api/bookings/:id/cancel', requireResident, async (req, res) => {
    const { id } = req.params;
    const notFound = () => fail(res, 404, 'NOT_FOUND', 'Booking not found.');
    if (!UUID.test(id)) return notFound();
    const booking = await store.setBookingStatus(
      req.residentId,
      id,
      CANCELLABLE,
      BOOKING_STATES.CANCELLED,
    );
    if (booking) return res.json({ booking });
    // Someone else's booking looks the same as a missing one.
    if (!(await store.findBooking(req.residentId, id))) return notFound();
    fail(res, 409, 'CANNOT_CANCEL', 'This booking can no longer be cancelled.');
  });

  app.use('/api', (req, res) => fail(res, 404, 'NOT_FOUND', 'No such endpoint.'));

  // The prototype is the front end for now. Same origin as the API, so no CORS and no second host.
  app.use(
    express.static(PROTOTYPE_DIR, { setHeaders: (res) => res.set('Cache-Control', 'no-cache') }),
  );

  // Express 5 sends rejected async handlers here.
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')
      return fail(res, 400, 'VALIDATION_ERROR', 'The request body is not valid JSON.');
    console.error(`${req.method} ${req.path}:`, err.message);
    fail(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  });
  return app;
}

// Exported without listen() so Supertest and the Vite dev server can mount it.
export const app = createApp();
