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
  // Description: Verifies that the shared domain contract defines the three standard service tiers along with their exact minimum and maximum completion durations.
  // Expected Result: Matches the specification for CHECKUP at 15 minutes, STANDARD between 30 and 60 minutes, and MAJOR at 60 minutes or more.
  it('has the three service types and durations', () => {
    expect(SERVICE_TYPES).toEqual({
      CHECKUP: { label: 'Checkup / Quick Repair', minMinutes: 15, maxMinutes: 15 },
      STANDARD: { label: 'Standard Service', minMinutes: 30, maxMinutes: 60 },
      MAJOR: { label: 'Major Repair', minMinutes: 60, maxMinutes: null },
    });
  });

  // Description: Validates that initial booking states and allowed state transitions strictly match the state machine matrix for on-demand and scheduled jobs.
  // Expected Result: On-demand starts at Requested and scheduled starts at Pending Confirmation with defined progression paths.
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

  // Description: Enforces contract transition rules, permitting valid state advancements while restricting illegal moves and cancellations after work starts.
  // Expected Result: Returns true for valid transitions such as Requested to Accepted, and false for invalid transitions or mid-progress cancellations.
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
