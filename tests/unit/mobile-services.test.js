import { describe, expect, it } from 'vitest';
import { BOOKING_STATES as S, BOOKING_TYPES, canTransition } from '../../src/utils/contract.js';
import {
  cancelBooking,
  contractStatus,
  requestBooking,
  totalOf,
} from '../../mobile/services/bookings';
import { pickFor } from '../../mobile/services/manongs';
import { chargeTip } from '../../mobile/services/payments';
import { CATALOG } from '../../mobile/mocks/catalog';
import { ROSTER } from '../../mobile/mocks/account';

const address = { title: 'Green Residences, Tower 1', detail: 'Unit 6', short: 'Unit 6, Tower 1' };
const draft = (over = {}) => ({
  category: 'plumbing',
  serviceType: 'CHECKUP',
  desc: '',
  symptoms: ['Dripping Water'],
  photos: 0,
  notes: '',
  bookingType: 'scheduled',
  day: 1,
  time: '10:30 AM',
  manongKey: null,
  avoidKey: null,
  ...over,
});

describe('mobile booking services (Flow 4)', () => {
  it.each([
    [BOOKING_TYPES.ON_DEMAND, ['finding', 'onway', 'arrived', 'done']],
    [BOOKING_TYPES.SCHEDULED, ['pending', 'confirmed', 'onway', 'arrived', 'done']],
  ])('walks the %s happy path through allowed contract moves', (type, stages) => {
    const path = stages.map((st) => contractStatus(st, type));
    for (let i = 1; i < path.length; i++)
      if (path[i] !== path[i - 1]) expect(canTransition(type, path[i - 1], path[i])).toBe(true);
    expect(path.at(-1)).toBe(S.COMPLETED);
    expect(
      canTransition(
        BOOKING_TYPES.SCHEDULED,
        contractStatus('pending', 'scheduled'),
        contractStatus('declined', 'scheduled'),
      ),
    ).toBe(true);
  });

  it('books the nearest free Manong, skips who is busy or declined, and honours a pick', () => {
    const roster = ROSTER.plumbing;
    expect(pickFor(roster, draft()).manong.first).toBe('Clariso');
    expect(pickFor(roster, draft({ avoidKey: 'clariso' })).manong.first).toBe('John');
    expect(pickFor(roster, draft({ manongKey: 'ramon' })).manong.first).toBe('Clariso'); // Ramon is booked at 10:30
    expect(pickFor(roster, draft({ manongKey: 'john' })).manong.first).toBe('John');
  });

  it('starts "now" jobs as a search and scheduled ones as pending', async () => {
    await expect(
      requestBooking(draft({ bookingType: 'on-demand' }), address, ROSTER.plumbing),
    ).resolves.toMatchObject({ stage: 'finding', time: 'Now' });
    await expect(requestBooking(draft(), address, ROSTER.plumbing)).resolves.toMatchObject({
      stage: 'pending',
    });
    await expect(
      requestBooking(draft({ symptoms: [] }), address, ROSTER.plumbing),
    ).rejects.toThrow();
    await expect(requestBooking(draft(), undefined, ROSTER.plumbing)).rejects.toThrow();
  });

  it('totals price, voucher, approved part and tip, and refuses to cancel a started job', async () => {
    const b = await requestBooking(draft(), address, ROSTER.plumbing);
    expect(totalOf(b, true, 50, CATALOG)).toBe(250);
    expect(totalOf({ ...b, partApproved: true }, true, 50, CATALOG)).toBe(430);
    await expect(cancelBooking({ ...b, stage: 'arrived' }, null)).rejects.toThrow();
    await expect(chargeTip(-1, 'gcash')).rejects.toThrow();
  });
});
