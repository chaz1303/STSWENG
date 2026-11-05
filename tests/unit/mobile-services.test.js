import { describe, expect, it } from 'vitest';
import { BOOKING_STATES as S, BOOKING_TYPES, canTransition } from '../../src/utils/contract.js';
import { cancelBooking, contractStatus, setMockStage } from '../../mobile/services/bookings';
import { pay } from '../../mobile/services/payments';
import { mockFlags } from '../../mobile/mocks/flags';
import { CATALOG } from '../../mobile/mocks/catalog';
import { ALFRED } from '../../mobile/mocks/account';

const booking = (bookingType, stage = 'confirmed') => ({
  id: 'MJ-1',
  category: 'plumbing',
  serviceType: 'STANDARD',
  bookingType,
  problem: 'Leak',
  day: null,
  time: null,
  address: { label: 'Home', bldg: 'Green Residences', unit: '12B', city: '', note: '' },
  manong: ALFRED,
  stage,
  payment: 'gcash',
  parts: [],
});

describe('mobile booking services', () => {
  it.each(Object.values(BOOKING_TYPES))(
    'walks the %s happy path through allowed contract moves',
    (type) => {
      const path = ['booked', 'confirmed', 'onway', 'inprogress', 'completed'].map((st) =>
        contractStatus(st, type),
      );
      for (let i = 1; i < path.length; i++)
        if (path[i] !== path[i - 1]) expect(canTransition(type, path[i - 1], path[i])).toBe(true);
      expect(path.at(-1)).toBe(S.COMPLETED);
    },
  );

  it('refuses to cancel once the job is in progress', async () => {
    await expect(cancelBooking(booking('scheduled', 'inprogress'), 0, CATALOG)).rejects.toThrow();
    await expect(cancelBooking(booking('scheduled'), 0, CATALOG)).resolves.toMatchObject({
      status: 'cancelled',
    });
  });

  it('adds the extra part to a finished job only once', () => {
    const done = setMockStage(booking('scheduled'), 'completed', CATALOG);
    expect(done.parts).toEqual([['P-trap, PVC 1½ in', 180]]);
    expect(setMockStage(done, 'paid', CATALOG).parts).toHaveLength(1);
  });

  it('fails one GCash payment when the dev flag is on, then succeeds', async () => {
    mockFlags.failNextPayment = true;
    await expect(pay(booking('scheduled', 'completed'), 'gcash')).rejects.toThrow();
    await expect(pay(booking('scheduled', 'completed'), 'gcash')).resolves.toMatchObject({
      stage: 'paid',
    });
  });
});
