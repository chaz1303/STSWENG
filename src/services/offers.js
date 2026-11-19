// Rules for what happens after a request is sent: Manong offers, chat, extra charges (U14), progress,
// and the resident's rating (U16, U17). Pure functions: no database, no Express.
// Each returns { value } ready to store, or { fields } naming each bad field.
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const peso = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
const result = (fields, value) => (Object.keys(fields).length ? { fields } : { value });

export const PAYMENT_METHODS = ['gcash', 'cash'];
export const AIDE_STATUSES = ['on_the_way', 'arrived'];

// A Manong's answer: no price (or the resident's price) takes the offer, any other price counters it.
export function validateOffer(body) {
  const b = body ?? {};
  const fields = {};
  if (typeof b.aide_id !== 'string' || !b.aide_id) fields.aide_id = 'Choose which Manong you are.';
  const price = b.price ?? null;
  if (price !== null && !peso(price, 0, 1e6)) fields.price = 'Enter a whole peso amount.';
  return result(fields, { aide_id: b.aide_id, price });
}

// marn, 2026-11-14: a Manong offers only on his own services, and never below the resident's price
// (taking it, or countering higher). 2026-11-19: and only in a condo he is accredited at.
// Returns null when the offer is allowed, else the problem.
export function checkOffer(aide, booking, price) {
  if (!aide.categories.includes(booking.category))
    return { code: 'NOT_YOUR_SERVICE', message: `${booking.category} isn't one of your services.` };
  if (!aide.condos.includes(booking.condo_id))
    return {
      code: 'NOT_ACCREDITED',
      message: `You aren't accredited at ${booking.condo_name}.`,
    };
  const asked = booking.price_offer ?? booking.base_price;
  if (asked != null && price < asked)
    return { field: `Offer at least ₱${asked}, the resident's price.` };
  return null;
}

// Mock aide: add a Manong, or (partial) change his services, accredited condos or active flag.
// categories and condos are full replacement lists. Returns { value } or { fields }.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validateAide(body, { partial = false } = {}) {
  const b = body ?? {};
  const fields = {};
  const value = {};
  for (const k of ['first_name', 'last_name']) {
    if (partial && b[k] === undefined) continue;
    const v = str(b[k]);
    if (!v || v.length > 60) fields[k] = 'Enter a name of up to 60 characters.';
    else value[k] = v;
  }
  if (b.categories !== undefined || !partial) {
    const c = b.categories ?? [];
    if (!Array.isArray(c) || c.length > 20 || c.some((x) => typeof x !== 'string' || x.length > 30))
      fields.categories = 'Pick his services.';
    else value.categories = c.map((x) => x.toLowerCase());
  }
  if (b.condos !== undefined || !partial) {
    const c = b.condos ?? [];
    if (!Array.isArray(c) || c.length > 50 || c.some((x) => typeof x !== 'string' || !UUID.test(x)))
      fields.condos = 'Pick the condos he is accredited at.';
    else value.condos = c;
  }
  if (b.is_active !== undefined) {
    if (typeof b.is_active !== 'boolean') fields.is_active = 'Use true or false.';
    else value.is_active = b.is_active;
  }
  if (partial && !Object.keys(fields).length && !Object.keys(value).length)
    fields.is_active = 'Send at least one field to change.';
  return result(fields, value);
}

// A scheduled job can start at most this long before its time.
export const EARLY_START_MINUTES = 60;
export function tooEarlyToStart(booking, now = new Date()) {
  if (booking.booking_type !== 'scheduled' || !booking.scheduled_for) return false;
  return now.getTime() < new Date(booking.scheduled_for).getTime() - EARLY_START_MINUTES * 60000;
}

// Why the resident cancelled (optional).
export function validateCancelReason(body) {
  const r = body?.reason ?? null;
  if (r === null) return { value: { reason: null } };
  const reason = str(r);
  return typeof r !== 'string' || reason.length > 200
    ? { fields: { reason: 'Keep the reason under 200 characters.' } }
    : { value: { reason: reason || null } };
}

// The resident raises the offer while waiting ("Need faster arrival?"). Only up, never down.
export function validateRaise(body, current) {
  const p = body?.price_offer;
  if (!peso(p, 0, 1e6)) return { fields: { price_offer: 'Enter a whole peso amount.' } };
  if (current != null && p <= current)
    return { fields: { price_offer: `Offer more than your current ₱${current}.` } };
  return { value: { price_offer: p } };
}

export function validateMessage(body) {
  const text = str(body?.body);
  return !text || text.length > 500
    ? { fields: { body: 'Write a message of up to 500 characters.' } }
    : { value: { body: text } };
}

export function validateCharge(body) {
  const b = body ?? {};
  const fields = {};
  const label = str(b.label);
  if (!label || label.length > 80) fields.label = 'Name the item, up to 80 characters.';
  if (!peso(b.amount, 1, 100000)) fields.amount = 'Enter a whole peso amount from 1 to 100,000.';
  return result(fields, { label, amount: b.amount });
}

// On the way (with an ETA in minutes) or arrived.
export function validateProgress(body) {
  const b = body ?? {};
  const fields = {};
  if (!AIDE_STATUSES.includes(b.aide_status))
    fields.aide_status = `Choose one of: ${AIDE_STATUSES.join(', ')}.`;
  const eta = b.aide_status === 'on_the_way' ? (b.eta_minutes ?? null) : null;
  if (eta !== null && !peso(eta, 0, 600)) fields.eta_minutes = 'Enter minutes from 0 to 600.';
  return result(fields, { aide_status: b.aide_status, eta_minutes: eta });
}

export function validateReview(body) {
  const b = body ?? {};
  const fields = {};
  if (!peso(b.rating, 1, 5)) fields.rating = 'Pick 1 to 5 stars.';
  const praise = b.praise == null ? [] : Array.isArray(b.praise) ? b.praise.map(str) : null;
  if (!praise || praise.length > 6 || praise.some((x) => !x || x.length > 40))
    fields.praise = 'Pick up to 6 compliments.';
  if (b.review != null && typeof b.review !== 'string')
    fields.review = 'Write your review as text.';
  const review = str(b.review);
  if (review.length > 500) fields.review = 'Keep the review under 500 characters.';
  const tip = b.tip ?? 0;
  if (!peso(tip, 0, 100000)) fields.tip = 'Enter a whole peso tip.';
  const payment_method = b.payment_method ?? null;
  if (payment_method !== null && !PAYMENT_METHODS.includes(payment_method))
    fields.payment_method = 'Choose GCash or cash.';
  return result(fields, { rating: b.rating, praise, review, tip, payment_method });
}

// U15: the agreed price (or the resident's offer, or the base price) plus approved charges and tip.
export function billTotal(booking, charges = []) {
  const price = booking.agreed_price ?? booking.price_offer ?? booking.base_price ?? 0;
  const extra = charges.filter((c) => c.status === 'approved').reduce((a, c) => a + c.amount, 0);
  return price + extra + (booking.tip ?? 0);
}
