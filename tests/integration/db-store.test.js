// TC-BE-01 (ICM open item 30): the API on the real SQL store (src/server/store.js), not memoryStore().
// Runs only when DATABASE_URL points at localhost, as in CI's disposable Postgres service. A remote
// URL (the shared Supabase database) is skipped on purpose: these tests write rows.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { getDb } from '../../src/server/db.js';
import { pgStore } from '../../src/server/store.js';
import { BOOKING_STATES as S } from '../../src/utils/contract.js';
import { apiClient, newResident } from '../helpers/apiClient.js';

const local = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(process.env.DATABASE_URL ?? '');

describe.skipIf(!local)('real PostgreSQL store (TC-BE-01)', () => {
  let api, db;
  const residents = [];
  const signUp = async (who) => {
    const r = await api.signUp(who);
    residents.push(r.resident.id);
    return r;
  };

  beforeAll(() => {
    db = getDb();
    api = apiClient(pgStore(getDb));
  });
  afterAll(async () => {
    // Bookings don't cascade from residents; offers, charges, reviews and history cascade from bookings.
    await db.query('DELETE FROM usr_bookings WHERE resident_id = ANY($1)', [residents]);
    await db.query('DELETE FROM usr_residents WHERE resident_id = ANY($1)', [residents]);
    await db.end();
  });

  it('stores a resident with a hashed password, and logs in against it', async () => {
    const who = newResident();
    const { resident } = await signUp(who);
    const { rows } = await db.query(
      'SELECT email, mobile_number, password_hash FROM usr_residents WHERE resident_id = $1',
      [resident.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(who.email);
    expect(rows[0].mobile_number).toBe(`+63${who.mobile_number.slice(1)}`);
    expect(rows[0].password_hash).toMatch(/^scrypt\$/);

    const login = await request(api.app)
      .post('/api/auth/login')
      .send({ mobile_number: who.mobile_number, password: who.password });
    expect(login.status).toBe(200);
    expect(login.body.resident.id).toBe(resident.id);
  });

  it('turns the UNIQUE constraints into 409s', async () => {
    const who = newResident();
    await signUp(who);
    const again = await request(api.app)
      .post('/api/auth/register')
      .send({ ...newResident(), email: who.email });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('reads the seeded catalogue from aide_service_categories and aide_service_prices', async () => {
    const res = await request(api.app).get('/api/categories');
    expect(res.status).toBe(200);
    const plumbing = res.body.categories.find((c) => c.key === 'plumbing');
    expect(plumbing.services.map((s) => [s.service_type, s.base_price])).toEqual([
      ['CHECKUP', 250],
      ['STANDARD', 450],
      ['MAJOR', 800],
    ]);
  });

  it('runs a booking through offer, charge, completion and review in SQL', async () => {
    const who = await signUp();
    const created = await api.book(who);
    expect(created.status).toBe(201);
    const id = created.body.booking.id;
    expect(created.body.booking).toMatchObject({ status: S.REQUESTED, base_price: 450 });

    const manong = await api.assign(who, id);
    expect(
      (
        await api.aide('patch', `/bookings/${id}/status`, {
          aide_id: manong.id,
          status: S.IN_PROGRESS,
        })
      ).status,
    ).toBe(200);
    const charge = await api.aide('post', `/bookings/${id}/charges`, {
      aide_id: manong.id,
      label: 'Replacement Pipe Elbow',
      amount: 150,
    });
    expect(charge.status).toBe(201);
    const decided = await request(api.app)
      .patch(`/api/bookings/${id}/charges/${charge.body.charge.id}`)
      .set(api.as(who.token))
      .send({ approved: true });
    expect(decided.status).toBe(200);
    expect(
      (
        await api.aide('patch', `/bookings/${id}/status`, {
          aide_id: manong.id,
          status: S.COMPLETED,
        })
      ).status,
    ).toBe(200);
    const review = await request(api.app)
      .post(`/api/bookings/${id}/review`)
      .set(api.as(who.token))
      .send({ rating: 5, praise: ['Punctual'], tip: 50 });
    expect(review.status).toBe(200);

    const detail = await request(api.app).get(`/api/bookings/${id}`).set(api.as(who.token));
    expect(detail.body.booking.status).toBe(S.COMPLETED);
    expect(detail.body.total).toBe(450 + 150 + 50);

    const { rows } = await db.query(
      'SELECT to_status FROM usr_booking_status_history WHERE booking_id = $1 ORDER BY changed_at',
      [id],
    );
    expect(rows.map((r) => r.to_status)).toEqual(
      expect.arrayContaining([S.ACCEPTED, S.IN_PROGRESS, S.COMPLETED]),
    );
  });

  it('keeps each resident out of the others bookings', async () => {
    const juan = await signUp();
    const maria = await signUp();
    const id = (await api.book(juan)).body.booking.id;
    const peek = await request(api.app).get(`/api/bookings/${id}`).set(api.as(maria.token));
    expect(peek.status).toBe(404);
    const cancel = await request(api.app)
      .patch(`/api/bookings/${id}/cancel`)
      .set(api.as(maria.token));
    expect(cancel.status).toBe(404);
  });
});
