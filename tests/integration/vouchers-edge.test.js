// TC-BE-03: POST /api/vouchers/validate. Written before the route exists, so every case fails with 404
// today. Contract from the backlog: a valid code returns { valid: true, discount_amount }, and an
// invalid or expired code returns 400.
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { apiClient } from '../helpers/apiClient.js';
import { memoryStore } from '../helpers/memoryStore.js';

let api, who;
const validate = (body, token = who.token) =>
  request(api.app).post('/api/vouchers/validate').set(api.as(token)).send(body);

beforeEach(async () => {
  api = apiClient(memoryStore());
  who = await api.signUp();
});

describe('POST /api/vouchers/validate (TC-BE-03)', () => {
  // Description: Validates that submitting recognized promo code MANONG50 calculates and returns a ₱50 discount amount.
  // Expected Result: Responds with HTTP 200 and { valid: true, discount_amount: 50 }.
  it('takes ₱50 off with MANONG50', async () => {
    const res = await validate({ code: 'MANONG50', category: 'plumbing', base_amount: 500 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true, discount_amount: 50 });
  });

  // Description: Ensures that an unrecognized promo code is rejected with client error status and no discount returned.
  // Expected Result: Responds with HTTP 400 and has no discount_amount property.
  it('rejects an unknown code with 400', async () => {
    const res = await validate({ code: 'NOPE2026', category: 'plumbing', base_amount: 500 });
    expect(res.status).toBe(400);
    expect(res.body).not.toHaveProperty('discount_amount');
  });

  // Description: Enforces request payload validation rejecting missing code, non-string codes, negative amounts, or text amounts.
  // Expected Result: Responds with HTTP 400 Bad Request across all invalid parameter cases.
  it.each([
    ['no code', { category: 'plumbing', base_amount: 500 }],
    ['a non-string code', { code: 50, category: 'plumbing', base_amount: 500 }],
    ['a negative amount', { code: 'MANONG50', category: 'plumbing', base_amount: -1 }],
    ['a text amount', { code: 'MANONG50', category: 'plumbing', base_amount: '500' }],
  ])('rejects %s with 400', async (_, body) => {
    expect((await validate(body)).status).toBe(400);
  });

  // Description: Verifies that promo discounts cannot exceed the base booking price or result in a negative total.
  // Expected Result: Caps the discount amount at or below the base amount (e.g. <= ₱30 for ₱30 base) or returns HTTP 400.
  it('never discounts below zero', async () => {
    const res = await validate({ code: 'MANONG50', category: 'plumbing', base_amount: 30 });
    // Either refused (minimum spend) or capped at the amount; never a ₱50 discount on ₱30.
    if (res.status === 200) expect(res.body.discount_amount).toBeLessThanOrEqual(30);
    else expect(res.status).toBe(400);
  });

  // Description: Ensures that voucher validation requires an authenticated resident session.
  // Expected Result: Unauthenticated requests return HTTP 401 Unauthorized.
  it('needs a signed-in resident', async () => {
    const res = await request(api.app)
      .post('/api/vouchers/validate')
      .send({ code: 'MANONG50', category: 'plumbing', base_amount: 500 });
    expect(res.status).toBe(401);
  });
});
