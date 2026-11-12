// Booking rules (U05 to U13). Pure functions: no database, no Express.
import { BOOKING_STATES, BOOKING_TYPES, INITIAL_STATE, SERVICE_TYPES } from '../utils/contract.js';

const S = BOOKING_STATES;
const str = (v) => (typeof v === 'string' ? v.trim() : '');

// Residents can cancel only before In Progress (booking-states.md, U13). contract.js TRANSITIONS
// lists two of these four; the other two are the ones its comment says U13 implies.
export const CANCELLABLE = [S.REQUESTED, S.PENDING_CONFIRMATION, S.ACCEPTED, S.CONFIRMED];
export const canCancel = (status) => CANCELLABLE.includes(status);

// Returns { value } ready to store, or { fields } naming each bad field.
export function validateBooking(body, now = new Date()) {
  const b = body ?? {};
  const fields = {};
  const category = str(b.category).toLowerCase();
  const address = str(b.address);
  const problem = str(b.problem);
  const booking_type = b.booking_type;
  const price_offer = b.price_offer ?? null;
  let scheduled_for = null;

  if (!/^[a-z][a-z -]{1,29}$/.test(category)) fields.category = 'Choose a service.';
  if (typeof b.service_type !== 'string' || !Object.hasOwn(SERVICE_TYPES, b.service_type))
    fields.service_type = `Choose one of: ${Object.keys(SERVICE_TYPES).join(', ')}.`;
  if (!Object.values(BOOKING_TYPES).includes(booking_type)) {
    fields.booking_type = `Choose one of: ${Object.values(BOOKING_TYPES).join(', ')}.`;
  } else if (booking_type === BOOKING_TYPES.SCHEDULED) {
    const t = typeof b.scheduled_for === 'string' ? new Date(b.scheduled_for) : null;
    if (!t || Number.isNaN(t.getTime()) || t <= now)
      fields.scheduled_for = 'Pick a date and time in the future.';
    else scheduled_for = t.toISOString();
  } else if (b.scheduled_for != null) {
    fields.scheduled_for = 'On-demand bookings have no scheduled time.';
  }
  if (!address || address.length > 200) fields.address = 'Enter the service address.';
  if (problem.length > 300) fields.problem = 'Keep the description under 300 characters.';
  if (
    price_offer !== null &&
    !(Number.isInteger(price_offer) && price_offer >= 0 && price_offer <= 1e6)
  )
    fields.price_offer = 'Enter a whole peso amount.';

  if (Object.keys(fields).length) return { fields };
  const status = INITIAL_STATE[booking_type];
  return {
    value: {
      category,
      service_type: b.service_type,
      booking_type,
      status,
      scheduled_for,
      address,
      problem,
      price_offer,
    },
  };
}
