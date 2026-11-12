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
const PROTOTYPE_DIR = fileURLToPath(new URL('../../prototype', import.meta.url));
// Compared against when the account doesn't exist, so a wrong number takes as long as a wrong password.
const DUMMY_HASH = hashPassword('no such resident');

const fail = (res, status, code, message, fields) =>
  res.status(status).json({ error: { code, message, ...(fields && { fields }) } });
const publicResident = (r) => ({
  id: r.id,
  email: r.email,
  mobile_number: r.mobile_number,
  full_name: r.full_name,
  email_verified: Boolean(r.email_verified_at),
});
function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters');
  return s;
}

// Fixed-window limit per IP for the sign-in routes: scrypt is slow on purpose, so unlimited tries
// would let one client tie up the server or guess passwords (open item 18).
// shortcut: counts in memory, so it resets on restart and isn't shared between instances. Move it to
// the database or the host's limiter when the app runs on more than one instance.
function rateLimit(max, windowMs) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    const h = hits.get(req.ip);
    if (!h || h.reset <= now) hits.set(req.ip, { n: 1, reset: now + windowMs });
    else if (++h.n > max) {
      res.set('Retry-After', String(Math.ceil((h.reset - now) / 1000)));
      return fail(
        res,
        429,
        'TOO_MANY_REQUESTS',
        'Too many attempts. Please wait a few minutes and try again.',
      );
    }
    next();
  };
}

// `store` and `secret` can be replaced in tests. The default store reaches the database lazily, so
// routes that don't need it (health, the static prototype) work without DATABASE_URL.
export function createApp({ store = pgStore(getDb), secret = jwtSecret, authLimit = 30 } = {}) {
  const app = express();
  app.set('trust proxy', 1); // one proxy in front on the host, so req.ip is the client's address
  app.disable('x-powered-by');
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  const auth = express.Router();
  auth.use(rateLimit(authLimit, 10 * 60 * 1000));
  auth.post('/register', async (req, res) => {
    const { value, fields } = validateRegister(req.body);
    if (fields)
      return fail(res, 400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', fields);
    const { password, ...rest } = value;
    try {
      const resident = await store.createResident({
        ...rest,
        password_hash: hashPassword(password),
      });
      // Soft verification (open item 3): the account works at once. No email is sent yet (item 15).
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
    const resident = await store.findResidentForLogin(value);
    const ok = verifyPassword(value.password, resident ? resident.password_hash : DUMMY_HASH);
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
