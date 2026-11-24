// Supertest helpers shared by the integration suites: an app on a given store, a fresh resident with
// one saved unit, bookings, and the mock aide API (stand-in for Team 2's app).
import { randomInt } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../src/server/app.js';

export const SECRET = 'integration-test-secret-integration-1234';
export const MOCK_AIDE_KEY = 'mock-aide-test-key';
export const CONDO = 'Avida Towers Prime Taft'; // accredited in db/schema.sql and memoryStore()

// Unique per call, so suites can share one real database without UNIQUE clashes.
export const newResident = () => {
  const n = randomInt(1_000_000, 10_000_000);
  return {
    email: `it${n}@example.com`,
    mobile_number: `0917${n}`,
    password: 'Secret#123',
    full_name: 'Juan Dela Cruz',
  };
};

export const plumbingRequest = {
  category: 'plumbing',
  service_type: 'STANDARD',
  booking_type: 'on-demand',
  problem: 'Kitchen sink leaks',
  payment_method: 'gcash',
};

export function apiClient(store) {
  const app = createApp({
    store,
    secret: () => SECRET,
    authLimit: 1000,
    mockAide: true,
    mockAideKey: MOCK_AIDE_KEY,
  });
  const as = (token) => ({ Authorization: `Bearer ${token}` });
  const aide = (method, path, body) =>
    request(app)
      [method](`/api/mock-aide${path}`)
      .set({ 'X-Mock-Aide-Key': MOCK_AIDE_KEY })
      .send(body);

  // Registers a resident with one saved unit. Returns { token, resident, unitId }.
  async function signUp(who = newResident()) {
    const reg = await request(app).post('/api/auth/register').send(who);
    if (reg.status !== 201) throw new Error(`register ${reg.status}: ${JSON.stringify(reg.body)}`);
    const unit = await request(app)
      .post('/api/me/units')
      .set(as(reg.body.token))
      .send({ building: CONDO, unit_number: '6' });
    if (unit.status !== 201) throw new Error(`unit ${unit.status}: ${JSON.stringify(unit.body)}`);
    return { token: reg.body.token, resident: reg.body.resident, unitId: unit.body.unit.id };
  }

  const book = ({ token, unitId }, body = {}) =>
    request(app)
      .post('/api/bookings')
      .set(as(token))
      .send({ ...plumbingRequest, unit_id: unitId, ...body });

  // An active plumbing Manong takes the resident's price and the resident accepts. Returns the Manong.
  async function assign(who, bookingId) {
    const first = (await aide('get', '/aides')).body.aides.find(
      (a) => a.is_active && a.categories.some((c) => c.toLowerCase() === 'plumbing'),
    );
    const offer = await aide('post', `/bookings/${bookingId}/offers`, { aide_id: first.id });
    if (offer.status !== 201)
      throw new Error(`offer ${offer.status}: ${JSON.stringify(offer.body)}`);
    const acc = await request(app)
      .post(`/api/bookings/${bookingId}/offers/${offer.body.offer.id}/accept`)
      .set(as(who.token));
    if (acc.status !== 200) throw new Error(`accept ${acc.status}: ${JSON.stringify(acc.body)}`);
    return first;
  }

  return { app, as, aide, signUp, book, assign };
}
