import { BOOKING_STATES, INITIAL_STATE } from '../../src/utils/contract.js';
import { CATALOG } from '../mocks/catalog';
import { mockFlags, wait } from '../mocks/flags';
import { pickManong } from './manongs';
import type {
  Address,
  Booking,
  BookingStatus,
  BookingType,
  Catalog,
  Charge,
  Draft,
  Manong,
  PastBooking,
  PaymentMethod,
  Stage,
} from '../types';

/** Thrown when no Manong is free; `nowJob` says which "none" screen to show. */
export class NoManongError extends Error {
  constructor(public nowJob: boolean) {
    super('No Manong is free');
  }
}

/** The contract state behind each screen status (proposed mapping, ICM open item 20). */
export function contractStatus(stage: Stage, type: BookingType): BookingStatus {
  const s = BOOKING_STATES;
  const accepted = type === 'on-demand' ? s.ACCEPTED : s.CONFIRMED;
  const map: Record<Stage, BookingStatus> = {
    booked: INITIAL_STATE[type],
    confirmed: accepted,
    onway: accepted,
    late: accepted,
    inprogress: s.IN_PROGRESS,
    completed: s.COMPLETED,
    paid: s.COMPLETED,
    cancelled: s.CANCELLED,
    mcancelled: s.CANCELLED,
  };
  return map[stage];
}

export const tierOf = (b: Pick<Booking, 'category' | 'serviceType'>, catalog: Catalog) =>
  catalog[b.category].tiers[b.serviceType];
export const serviceName = (b: Pick<Booking, 'category' | 'serviceType'>, catalog: Catalog) =>
  `${catalog[b.category].name}, ${tierOf(b, catalog).short}`;
/** Approved parts plus the materials every job of that service uses. */
export const materialsOf = (b: Booking, catalog: Catalog): Charge[] => [
  ...b.parts,
  ...catalog[b.category].extra,
];
export const totalOf = (b: Booking, catalog: Catalog) =>
  tierOf(b, catalog).price + materialsOf(b, catalog).reduce((sum, [, p]) => sum + p, 0);
export const dayLabel = (d: Date) =>
  d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

// TODO(backend): GET /api/services (final categories and prices are ICM open items 6 and 8).
export async function getCatalog(): Promise<Catalog> {
  await wait(200);
  return CATALOG;
}

// TODO(backend): matching request; the Manong's acceptance should arrive by push or websocket.
export async function findManong(draft: Draft): Promise<Manong> {
  await wait(2500);
  if (mockFlags.noManongFree && !draft.retried) {
    mockFlags.noManongFree = false;
    throw new NoManongError(draft.bookingType === 'on-demand');
  }
  return pickManong(draft.bookingType, draft.preferred);
}

let nextId = 8821;

// TODO(backend): POST /api/bookings; the server assigns the id and the contract's initial state.
export async function createBooking(
  draft: Draft,
  address: Address | undefined,
  payment: PaymentMethod,
  problem: string,
): Promise<Booking> {
  if (!address) throw new Error('Add an address first');
  if (!draft.manong) throw new Error('Pick a Manong before confirming.');
  await wait(600);
  return {
    id: `MJ-${nextId++}`,
    category: draft.category,
    serviceType: draft.serviceType,
    bookingType: draft.bookingType,
    problem: problem || 'General checkup',
    day: draft.bookingType === 'on-demand' ? new Date() : draft.day,
    time: draft.bookingType === 'on-demand' ? null : draft.time,
    address,
    manong: draft.manong,
    stage: 'confirmed',
    payment,
    parts: [],
  };
}

// shortcut: the Dev menu sets the status directly. TODO(backend): status changes arrive from the aide
// side by websocket or push; the app should only render them.
export function setMockStage(b: Booking, stage: Stage, catalog: Catalog): Booking {
  // A finished job in the prototype always used the extra part, so the bill shows materials.
  const part = catalog[b.category].part;
  const parts =
    ['completed', 'paid'].includes(stage) && !b.parts.length
      ? [[part[0], part[1]] as Charge]
      : b.parts;
  return { ...b, stage, parts };
}

// TODO(backend): PATCH /api/bookings/:id/parts.
export async function approvePart(b: Booking, catalog: Catalog): Promise<Booking> {
  const [name, price] = catalog[b.category].part;
  await wait(300);
  return b.parts.some(([n]) => n === name) ? b : { ...b, parts: [...b.parts, [name, price]] };
}

const toPast = (
  b: Booking,
  catalog: Catalog,
  lines: Charge[],
  status: PastBooking['status'],
  stars = 0,
): PastBooking => ({
  id: b.id,
  category: b.category,
  title: serviceName(b, catalog),
  date: b.day ? dayLabel(b.day) : 'Today',
  time: b.time ?? 'Now',
  manong: status === 'paid' ? b.manong : null,
  lines,
  status,
  stars,
  payment: b.payment,
});

// TODO(backend): POST /api/bookings/:id/cancel. Free until In Progress (U13); a ₱100 trip fee once on the way.
export async function cancelBooking(
  b: Booking,
  fee: number,
  catalog: Catalog,
): Promise<PastBooking> {
  if (contractStatus(b.stage, b.bookingType) === BOOKING_STATES.IN_PROGRESS)
    throw new Error('The job has started, so it can no longer be cancelled.');
  await wait(500);
  return toPast(b, catalog, [[fee ? 'Trip fee' : 'Cancelled before the job', fee]], 'cancelled');
}

// TODO(backend): POST /api/bookings/:id/rating (stars 0 means skipped).
export async function rateBooking(
  b: Booking,
  stars: number,
  _praise: string[],
  _note: string,
  catalog: Catalog,
): Promise<PastBooking> {
  await wait(400);
  return toPast(
    b,
    catalog,
    [['Base charge', tierOf(b, catalog).price], ...materialsOf(b, catalog)],
    'paid',
    stars,
  );
}

// TODO(backend): POST /api/bookings/:id/reports.
export async function reportProblem(_bookingId: string, reason: string | null, text: string) {
  if (!reason && !text.trim()) throw new Error('Pick what went wrong or describe it');
  await wait(500);
}
