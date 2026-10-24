// Shared contract with Team 2 (aide side), copied from docs/userStories.pdf p.2.
// The CI contract check compares this file against Team 2's definitions.
// Stored names/casing are not agreed yet; change them here only after Team 2 agrees.

export const SERVICE_TYPES = Object.freeze({
  CHECKUP: { label: 'Checkup / Quick Repair', minMinutes: 15, maxMinutes: 15 },
  STANDARD: { label: 'Standard Service', minMinutes: 30, maxMinutes: 60 },
  MAJOR: { label: 'Major Repair', minMinutes: 60, maxMinutes: null }, // "1+ hours": no upper bound
});

export const BOOKING_TYPES = Object.freeze({ ON_DEMAND: 'on-demand', SCHEDULED: 'scheduled' });

export const BOOKING_STATES = Object.freeze({
  REQUESTED: 'Requested',
  PENDING_CONFIRMATION: 'Pending Confirmation',
  ACCEPTED: 'Accepted',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
});

const S = BOOKING_STATES;

// Exactly as written in the PDF. Not listed there, though U13 implies them:
// on-demand Accepted -> Cancelled, scheduled Pending Confirmation -> Cancelled. Open with Team 2.
export const TRANSITIONS = Object.freeze({
  [BOOKING_TYPES.ON_DEMAND]: {
    [S.REQUESTED]: [S.ACCEPTED, S.DECLINED, S.CANCELLED],
    [S.ACCEPTED]: [S.IN_PROGRESS],
    [S.IN_PROGRESS]: [S.COMPLETED],
  },
  [BOOKING_TYPES.SCHEDULED]: {
    [S.PENDING_CONFIRMATION]: [S.CONFIRMED, S.DECLINED],
    [S.CONFIRMED]: [S.IN_PROGRESS, S.CANCELLED],
    [S.IN_PROGRESS]: [S.COMPLETED],
  },
});

export const INITIAL_STATE = Object.freeze({
  [BOOKING_TYPES.ON_DEMAND]: S.REQUESTED,
  [BOOKING_TYPES.SCHEDULED]: S.PENDING_CONFIRMATION,
});

export function canTransition(bookingType, from, to) {
  return TRANSITIONS[bookingType]?.[from]?.includes(to) ?? false;
}
