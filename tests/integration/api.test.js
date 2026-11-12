// API tests against an in-memory store. They never reach the shared database (CI plan §3.3).
// Gap: the SQL in src/server/store.js is not run here. There is no local Postgres or CI service
// container yet (ICM open item 30).
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { BOOKING_STATES as S } from '../../src/utils/contract.js';
import { memoryStore } from '../helpers/memoryStore.js';

const SECRET = 'integration-test-secret-integration-1234';
const juan = {
  email: 'juan@example.com',
  mobile_number: '0917 123 4567',
  password: 'Secret#123',
  full_name: 'Juan Dela Cruz',
};
const maria = {
  email: 'maria@example.com',
  mobile_number: '0918 765 4321',
  password: 'Another#456',
  full_name: 'Maria Santos',
};
const plumbing = {
  category: 'plumbing',
  service_type: 'CHECKUP',
  booking_type: 'on-demand',
  address: 'Unit 6, Tower 1',
  problem: 'Dripping water',
  price_offer: 250,
};

let store, app;
beforeEach(() => {
  store = memoryStore();
  app = createApp({ store, secret: () => SECRET, authLimit: 1000 });
});
const register = (body) => request(app).post('/api/auth/register').send(body);
const login = (body) => request(app).post('/api/auth/login').send(body);
const as = (token) => ({ Authorization: `Bearer ${token}` });
const tokenFor = async (who) => (await register(who)).body.token;

describe('POST /api/auth/register', () => {
  it('creates the account, returns a token and never the password hash', async () => {
    const res = await register(juan);
    expect(res.status).toBe(201);
    expect(res.body.resident).toEqual({
      id: expect.any(String),
      email: 'juan@example.com',
      mobile_number: '+639171234567',
      full_name: 'Juan Dela Cruz',
      email_verified: false,
    });
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(JSON.stringify(res.body)).not.toMatch(/password|scrypt/);
    expect(store.residents[0].password_hash).toMatch(/^scrypt\$/);
  });
  it('rejects a duplicate email and a duplicate mobile in any format', async () => {
    await register(juan);
    const email = await register({ ...maria, email: 'JUAN@example.com' });
    expect([email.status, email.body.error.code]).toEqual([409, 'EMAIL_TAKEN']);
    expect(email.body.error.message).toBe('An account with this email address already exists.');
    const mobile = await register({ ...maria, mobile_number: '+639171234567' });
    expect([mobile.status, mobile.body.error.code]).toEqual([409, 'MOBILE_TAKEN']);
  });
  it('returns the bad fields on a validation error', async () => {
    const res = await register({ email: 'nope', password: 'weak' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(res.body.error.fields).sort()).toEqual([
      'email',
      'full_name',
      'mobile_number',
      'password',
    ]);
  });
  it('answers malformed JSON with 400, not 500', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect([res.status, res.body.error.code]).toEqual([400, 'VALIDATION_ERROR']);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => register(juan));
  it('logs in with the mobile number or the email', async () => {
    for (const id of [{ mobile_number: '9171234567' }, { email: 'Juan@example.com' }]) {
      const res = await login({ ...id, password: juan.password });
      expect(res.status).toBe(200);
      expect(res.body.resident.full_name).toBe('Juan Dela Cruz');
      expect(JSON.stringify(res.body)).not.toMatch(/password|scrypt/);
    }
  });
  it('gives the same 401 for a wrong password and an unknown account', async () => {
    const wrong = await login({ mobile_number: juan.mobile_number, password: 'Secret#124' });
    const unknown = await login({ mobile_number: '0999 000 0000', password: juan.password });
    expect([wrong.status, wrong.body.error.code]).toEqual([401, 'INVALID_CREDENTIALS']);
    expect(unknown.body).toEqual(wrong.body);
  });
  it('validates the body', async () => {
    const res = await login({ mobile_number: '123' });
    expect([res.status, res.body.error.code]).toEqual([400, 'VALIDATION_ERROR']);
    expect(Object.keys(res.body.error.fields).sort()).toEqual(['mobile_number', 'password']);
  });
  it('limits repeated attempts', async () => {
    const strict = createApp({ store, secret: () => SECRET, authLimit: 3 });
    const tries = [];
    for (let i = 0; i < 4; i++)
      tries.push(
        (
          await request(strict)
            .post('/api/auth/login')
            .send({ mobile_number: juan.mobile_number, password: 'x' })
        ).status,
      );
    expect(tries).toEqual([401, 401, 401, 429]);
  });
});

describe('GET /api/me', () => {
  it('returns the caller', async () => {
    const res = await request(app)
      .get('/api/me')
      .set(as(await tokenFor(juan)));
    expect(res.status).toBe(200);
    expect(res.body.resident.email).toBe('juan@example.com');
  });
  it('needs a valid token', async () => {
    for (const header of [{}, { Authorization: 'Bearer nope' }, { Authorization: 'Basic abc' }]) {
      const res = await request(app).get('/api/me').set(header);
      expect([res.status, res.body.error.code]).toEqual([401, 'UNAUTHENTICATED']);
    }
  });
});

describe('bookings', () => {
  it('creates a booking in the contract initial state and lists it', async () => {
    const token = await tokenFor(juan);
    const made = await request(app).post('/api/bookings').set(as(token)).send(plumbing);
    expect(made.status).toBe(201);
    expect(made.body.booking).toMatchObject({
      category: 'plumbing',
      service_type: 'CHECKUP',
      status: S.REQUESTED,
      price_offer: 250,
    });
    expect(made.body.booking).not.toHaveProperty('resident_id');
    const sched = await request(app)
      .post('/api/bookings')
      .set(as(token))
      .send({
        ...plumbing,
        category: 'cleaning',
        service_type: 'STANDARD',
        booking_type: 'scheduled',
        scheduled_for: '2099-01-01T02:30:00Z',
      });
    expect(sched.body.booking.status).toBe(S.PENDING_CONFIRMATION);
    const list = await request(app).get('/api/bookings').set(as(token));
    expect(list.body.bookings.map((b) => b.category)).toEqual(['cleaning', 'plumbing']);
  });
  it("never shows or cancels someone else's booking", async () => {
    const [juanToken, mariaToken] = [await tokenFor(juan), await tokenFor(maria)];
    const { id } = (await request(app).post('/api/bookings').set(as(juanToken)).send(plumbing)).body
      .booking;
    expect((await request(app).get('/api/bookings').set(as(mariaToken))).body.bookings).toEqual([]);
    const res = await request(app).patch(`/api/bookings/${id}/cancel`).set(as(mariaToken));
    expect([res.status, res.body.error.code]).toEqual([404, 'NOT_FOUND']);
    expect(store.bookings[0].status).toBe(S.REQUESTED);
  });
  it('cancels before In Progress and refuses after', async () => {
    const token = await tokenFor(juan);
    const { id } = (await request(app).post('/api/bookings').set(as(token)).send(plumbing)).body
      .booking;
    const ok = await request(app).patch(`/api/bookings/${id}/cancel`).set(as(token));
    expect([ok.status, ok.body.booking.status]).toEqual([200, S.CANCELLED]);
    const again = await request(app).patch(`/api/bookings/${id}/cancel`).set(as(token));
    expect([again.status, again.body.error.code]).toEqual([409, 'CANNOT_CANCEL']);
    const second = (await request(app).post('/api/bookings').set(as(token)).send(plumbing)).body
      .booking;
    store.bookings.find((b) => b.id === second.id).status = S.IN_PROGRESS;
    expect(
      (await request(app).patch(`/api/bookings/${second.id}/cancel`).set(as(token))).status,
    ).toBe(409);
  });
  it('validates the body, the id and the token', async () => {
    const token = await tokenFor(juan);
    const bad = await request(app)
      .post('/api/bookings')
      .set(as(token))
      .send({ ...plumbing, service_type: 'QUICK', address: '' });
    expect(bad.status).toBe(400);
    expect(Object.keys(bad.body.error.fields).sort()).toEqual(['address', 'service_type']);
    expect(
      (await request(app).patch('/api/bookings/not-a-uuid/cancel').set(as(token))).status,
    ).toBe(404);
    expect((await request(app).post('/api/bookings').send(plumbing)).status).toBe(401);
    expect((await request(app).get('/api/bookings')).status).toBe(401);
  });
});

describe('everything else', () => {
  it('serves the prototype from the same origin', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('flow5.js');
  });
  it('reports database health without leaking the error message', async () => {
    expect((await request(app).get('/api/health/db')).body).toEqual({ status: 'ok' });
    const down = createApp({
      store: {
        ping: async () => {
          throw Object.assign(new Error('connect to db.secret-host failed'), {
            code: 'ENETUNREACH',
          });
        },
      },
      secret: () => SECRET,
    });
    const res = await request(down).get('/api/health/db');
    expect([res.status, res.body]).toEqual([503, { status: 'down', code: 'ENETUNREACH' }]);
  });
  it('answers unknown API paths with a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect([res.status, res.body.error.code]).toEqual([404, 'NOT_FOUND']);
  });
  it('fails closed when the store throws', async () => {
    const broken = createApp({
      store: {
        findResidentForLogin: async () => {
          throw new Error('db down');
        },
      },
      secret: () => SECRET,
    });
    const res = await request(broken)
      .post('/api/auth/login')
      .send({ mobile_number: juan.mobile_number, password: 'x' });
    expect([res.status, res.body.error.code]).toEqual([500, 'INTERNAL_ERROR']);
    expect(JSON.stringify(res.body)).not.toContain('db down');
  });
});
