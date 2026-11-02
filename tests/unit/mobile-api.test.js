import { describe, expect, it } from 'vitest';
import { BOOKING_STATES as S, BOOKING_TYPES, canTransition } from '../../src/utils/contract.js';
import { createBooking, getBooking, statusSteps } from '../../mobile/api.js';

describe('mobile mock api', () => {
  it('derives each booking type happy path from the contract', () => {
    expect(statusSteps(BOOKING_TYPES.SCHEDULED)).toEqual([
      S.PENDING_CONFIRMATION,
      S.CONFIRMED,
      S.IN_PROGRESS,
      S.COMPLETED,
    ]);
    expect(statusSteps(BOOKING_TYPES.ON_DEMAND)).toEqual([
      S.REQUESTED,
      S.ACCEPTED,
      S.IN_PROGRESS,
      S.COMPLETED,
    ]);
  });

  it('only moves a booking through allowed transitions and stops at Completed', async () => {
    const type = BOOKING_TYPES.SCHEDULED;
    let b = await createBooking({
      category: 'plumbing',
      serviceType: 'STANDARD',
      bookingType: type,
    });
    for (let i = 0; i < 5; i++) {
      const prev = b.status;
      b = await getBooking(b.id);
      if (prev !== S.COMPLETED) expect(canTransition(type, prev, b.status)).toBe(true);
    }
    expect(b.status).toBe(S.COMPLETED);
    expect(b.materials.length).toBeGreaterThan(0);
  });
});
