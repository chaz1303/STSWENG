import { BOOKING_STATES, INITIAL_STATE } from '../../src/utils/contract.js';
import { CATALOG } from '../mocks/catalog';
import { wait } from '../mocks/flags';
import { pickFor } from './manongs';
import type {
  Address,
  Booking,
  BookingStatus,
  BookingType,
  Catalog,
  Draft,
  PastBooking,
  PaymentMethod,
  RosterEntry,
  Stage,
} from '../types';

const VOUCHER_OFF = 50;

/** The contract state behind each screen status (proposed mapping, ICM open item 20). */
export function contractStatus(stage: Stage, type: BookingType): BookingStatus {
  const s = BOOKING_STATES;
  const accepted = type === 'on-demand' ? s.ACCEPTED : s.CONFIRMED;
  const map: Record<Stage, BookingStatus> = {
    finding: INITIAL_STATE[type],
    pending: INITIAL_STATE[type],
    confirmed: accepted,
    declined: s.DECLINED,
    onway: accepted,
    arrived: s.IN_PROGRESS,
    done: s.COMPLETED,
  };
  return map[stage];
}

/** A date `day` days from today. */
export const dateIn = (day: number) => new Date(Date.now() + day * 86400000);
export const weekday = (day: number) =>
  dateIn(day).toLocaleDateString('en-PH', { weekday: 'short' });
/** "Wed, Oct 21" */
export const dayLabel = (day: number) =>
  dateIn(day).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
export const whenText = (b: Pick<Booking, 'bookingType' | 'day' | 'time'>) =>
  b.bookingType === 'on-demand' ? 'Now' : `${dayLabel(b.day)}, ${b.time}`;

export const priceOf = (
  category: string,
  serviceType: Booking['serviceType'],
  voucher: boolean,
  catalog: Catalog,
) => catalog[category].tiers[serviceType].price - (voucher ? VOUCHER_OFF : 0);
/** What the resident pays at the end: price after voucher, the approved part, and the tip. */
export const totalOf = (b: Booking, voucher: boolean, tip: number, catalog: Catalog) =>
  priceOf(b.category, b.serviceType, voucher, catalog) +
  (b.partApproved ? catalog[b.category].part[1] : 0) +
  tip;

// TODO(backend): GET /api/services (final categories and prices are ICM open items 6 and 8).
export async function getCatalog(): Promise<Catalog> {
  await wait(200);
  return CATALOG;
}

let nextId = 8821;

// TODO(backend): POST /api/bookings. "Now" bookings start a search; the Manong's acceptance (and every
// later status) should arrive by push or websocket. Scheduled bookings wait for the Manong to confirm.
export async function requestBooking(
  draft: Draft,
  address: Address | undefined,
  roster: RosterEntry[],
): Promise<Booking> {
  if (!address) throw new Error('Add a service address first');
  if (!draft.desc.trim() && !draft.symptoms.length)
    throw new Error('Add a description or tap a symptom');
  const pick = pickFor(roster, draft);
  if (!pick) throw new Error('Nobody is free then. Try another time.');
  await wait(500);
  return {
    id: `MJ-${nextId++}`,
    category: draft.category,
    serviceType: draft.serviceType,
    bookingType: draft.bookingType,
    day: draft.bookingType === 'on-demand' ? 0 : draft.day,
    time: draft.bookingType === 'on-demand' ? 'Now' : draft.time,
    address,
    manong: pick.manong,
    stage: draft.bookingType === 'on-demand' ? 'finding' : 'pending',
    partApproved: false,
  };
}

// TODO(backend): POST /api/bookings/:id/cancel. Free until the job starts (U13).
export async function cancelBooking(b: Booking, _reason: string | null) {
  if (['arrived', 'done'].includes(b.stage))
    throw new Error('The job has started, so it can no longer be cancelled.');
  await wait(400);
}

// TODO(backend): PATCH /api/bookings/:id/parts.
export async function answerPart(b: Booking, approve: boolean): Promise<Booking> {
  await wait(300);
  return { ...b, partApproved: approve };
}

// TODO(backend): POST /api/bookings/:id/rating with stars, praise, review and tip.
export async function rateBooking(
  b: Booking,
  rating: { stars: number; praise: string[]; review: string; tip: number },
  payment: PaymentMethod,
  voucher: boolean,
  catalog: Catalog,
): Promise<PastBooking> {
  if (rating.stars < 1 || rating.stars > 5) throw new Error('Pick 1 to 5 stars');
  await wait(400);
  return {
    id: b.id,
    category: b.category,
    serviceType: b.serviceType,
    date: dateIn(b.day).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
    manong: b.manong,
    total: totalOf(b, voucher, rating.tip, catalog),
    payment,
  };
}

// TODO(backend): POST /api/bookings/:id/reports.
export async function reportIssue(_bookingId: string, reason: string | null, text: string) {
  if (!reason && !text.trim()) throw new Error('Pick what went wrong or describe it');
  await wait(400);
}
