import { describe, expect, it } from 'vitest';
import {
  BOOKING_TYPES,
  INITIAL_STATE,
  SERVICE_TYPES,
  TRANSITIONS,
  canTransition,
} from '../../src/utils/contract.js';

const { ON_DEMAND, SCHEDULED } = BOOKING_TYPES;

describe('shared contract (userStories.pdf p.2)', () => {
  it('has the three service types and durations', () => {
    expect(SERVICE_TYPES).toEqual({
      CHECKUP: { label: 'Checkup / Quick Repair', minMinutes: 15, maxMinutes: 15 },
      STANDARD: { label: 'Standard Service', minMinutes: 30, maxMinutes: 60 },
      MAJOR: { label: 'Major Repair', minMinutes: 60, maxMinutes: null },
    });
  });

  it('matches the booking state machine exactly', () => {
    expect(INITIAL_STATE).toEqual({
      [ON_DEMAND]: 'Requested',
      [SCHEDULED]: 'Pending Confirmation',
    });
    expect(TRANSITIONS).toEqual({
      [ON_DEMAND]: {
        Requested: ['Accepted', 'Declined', 'Cancelled'],
        Accepted: ['In Progress'],
        'In Progress': ['Completed'],
      },
      [SCHEDULED]: {
        'Pending Confirmation': ['Confirmed', 'Declined'],
        Confirmed: ['In Progress', 'Cancelled'],
        'In Progress': ['Completed'],
      },
    });
  });

  it('allows only listed transitions', () => {
    expect(canTransition(ON_DEMAND, 'Requested', 'Accepted')).toBe(true);
    expect(canTransition(SCHEDULED, 'Confirmed', 'Cancelled')).toBe(true);
    // No cancelling once work has started (U13).
    expect(canTransition(ON_DEMAND, 'In Progress', 'Cancelled')).toBe(false);
    expect(canTransition(SCHEDULED, 'In Progress', 'Cancelled')).toBe(false);
    // Final states go nowhere.
    expect(canTransition(ON_DEMAND, 'Completed', 'Requested')).toBe(false);
    expect(canTransition('unknown', 'Requested', 'Accepted')).toBe(false);
  });
});
