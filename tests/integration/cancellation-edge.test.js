// TC-EDGE-02 (U13): cancelling while the Manong is on the way. Cancelling is allowed today; the fee and
// refund are not built yet. The backlog names no fee amount or field names, so the cases below pin the
// smallest contract: the cancel response carries `cancellation_fee` and `refund_amount` (whole pesos),
// with no fee before a Manong is booked and a fee once he is travelling.
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { BOOKING_STATES as S } from '../../src/utils/contract.js';
import { apiClient } from '../helpers/apiClient.js';
import { memoryStore } from '../helpers/memoryStore.js';

let api, who, id;
const cancel = () =>
  request(api.app)
    .patch(`/api/bookings/${id}/cancel`)
    .set(api.as(who.token))
    .send({ reason: 'Plans changed' });

beforeEach(async () => {
  api = apiClient(memoryStore());
  who = await api.signUp();
  id = (await api.book(who, { price_offer: 500 })).body.booking.id;
});

async function onTheWay() {
  const manong = await api.assign(who, id);
  const moved = await api.aide('patch', `/bookings/${id}/progress`, {
    aide_id: manong.id,
    aide_status: 'on_the_way',
    eta_minutes: 10,
  });
  expect(moved.status).toBe(200);
  return manong;
}

describe('cancelling mid-transit (TC-EDGE-02)', () => {
  // Description: Validates that a resident can cancel an active booking while the assigned aide is en route.
  // Expected Result: Responds with HTTP 200 and marks booking state as 'Cancelled'.
  it('still lets the resident cancel while the Manong is on the way', async () => {
    await onTheWay();
    const res = await cancel();
    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe(S.CANCELLED);
  });

  // Description: Enforces state machine guardrail preventing job cancellation once the aide transitions to In Progress.
  // Expected Result: Rejects cancellation attempt with HTTP 409 Conflict and error code 'CANNOT_CANCEL'.
  it('refuses once work has started', async () => {
    const manong = await api.assign(who, id);
    await api.aide('patch', `/bookings/${id}/status`, {
      aide_id: manong.id,
      status: S.IN_PROGRESS,
    });
    const res = await cancel();
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CANNOT_CANCEL');
  });

  // Description: Verifies that cancelling an unassigned booking incurs zero cancellation penalty and issues a full refund.
  // Expected Result: Responds with HTTP 200, cancellation_fee: 0, and refund_amount equal to the full booking price (500).
  it('charges no fee before a Manong is booked', async () => {
    const res = await cancel();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ cancellation_fee: 0, refund_amount: 500 });
  });

  // Description: Assesses cancellation fee policy when cancelling on an in-transit aide and calculates remaining refund amount.
  // Expected Result: Responds with positive integer cancellation_fee and sets refund_amount to (price - fee).
  it('charges a fee once the Manong is on the way, and refunds the rest', async () => {
    await onTheWay();
    const res = await cancel();
    expect(res.status).toBe(200);
    const { cancellation_fee: fee, refund_amount: refund } = res.body;
    expect(Number.isInteger(fee) && fee > 0).toBe(true);
    expect(refund).toBe(500 - fee);
  });

  // Description: Confirms that the charged cancellation fee is persisted on the booking record for subsequent resident inspection.
  // Expected Result: Fetching booking details via GET /api/bookings/:id returns the recorded cancellation_fee value.
  it('shows the fee on the booking afterwards', async () => {
    await onTheWay();
    const { cancellation_fee: fee } = (await cancel()).body;
    expect(fee).toBeGreaterThan(0);
    const detail = await request(api.app).get(`/api/bookings/${id}`).set(api.as(who.token));
    expect(detail.body.booking.cancellation_fee).toBe(fee);
  });
});
