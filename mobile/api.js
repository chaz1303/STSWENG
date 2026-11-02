import { INITIAL_STATE, SERVICE_TYPES } from '../src/utils/contract.js';

// shortcut: in-memory mock with no server, swap each function for a fetch() once the backend routes exist.
let nextId = 1;
const bookings = {};

export async function getServices() {
  return Object.entries(SERVICE_TYPES).map(([id, s]) => ({ id, ...s }));
}

export async function createBooking({ serviceType, bookingType, problem }) {
  const booking = {
    id: String(nextId++),
    serviceType,
    bookingType,
    problem,
    status: INITIAL_STATE[bookingType],
  };
  bookings[booking.id] = booking;
  return booking;
}
