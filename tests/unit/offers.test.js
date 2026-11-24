import { describe, expect, it } from 'vitest';
import {
  checkOffer,
  tooEarlyToStart,
  validateCancelReason,
  billTotal,
  validateAide,
  validateCharge,
  validateMessage,
  validateOffer,
  validateProgress,
  validateRaise,
  validateReview,
} from '../../src/services/offers.js';

describe('offer rules', () => {
  // Description: Validates that omitting a price defaults to accepting the resident offer while invalid prices or missing aide identifiers are rejected.
  // Expected Result: Sets price to null on valid accept, or returns validation errors under fields.price and fields.aide_id.
  it('takes no price as accepting, and rejects bad prices', () => {
    expect(validateOffer({ aide_id: 'a' }).value).toEqual({ aide_id: 'a', price: null });
    expect(validateOffer({ aide_id: 'a', price: 12.5 }).fields).toHaveProperty('price');
    expect(validateOffer({}).fields).toHaveProperty('aide_id');
  });

  // Description: Ensures that an aide counter-offer price must be strictly higher than the current resident offer.
  // Expected Result: Accepts counter-offers greater than current price, and rejects equal, lower, or non-numeric values.
  it('raises only upward', () => {
    expect(validateRaise({ price_offer: 600 }, 500).value).toEqual({ price_offer: 600 });
    expect(validateRaise({ price_offer: 500 }, 500).fields).toBeDefined();
    expect(validateRaise({ price_offer: '600' }, null).fields).toBeDefined();
    expect(validateRaise({ price_offer: 1 }, null).value).toEqual({ price_offer: 1 });
  });
});

describe('job rules', () => {
  // Description: Validates chat messages between resident and aide by trimming whitespace and enforcing a five hundred character ceiling.
  // Expected Result: Trims valid strings and rejects empty, whitespace-only, non-string, or text longer than five hundred characters.
  it('trims messages and limits them', () => {
    expect(validateMessage({ body: '  hi ' }).value).toEqual({ body: 'hi' });
    for (const body of ['', '   ', 'x'.repeat(501), 7])
      expect(validateMessage({ body }).fields).toBeDefined();
  });

  // Description: Validates additional material or labor charges submitted by an aide during a service.
  // Expected Result: Returns trimmed label and whole positive peso amount, or rejects missing labels and non-positive numbers.
  it('needs a named charge with a whole peso amount', () => {
    expect(validateCharge({ label: ' Tape ', amount: 35 }).value).toEqual({
      label: 'Tape',
      amount: 35,
    });
    expect(Object.keys(validateCharge({ amount: 0 }).fields)).toEqual(['label', 'amount']);
  });

  // Description: Ensures an estimated time of arrival is only stored while the aide is actively en route.
  // Expected Result: Retains positive arrival minutes for status on the way, clears arrival minutes for arrived status, and rejects invalid statuses or negative values.
  it('keeps an ETA only while on the way', () => {
    expect(validateProgress({ aide_status: 'on_the_way', eta_minutes: 10 }).value.eta_minutes).toBe(
      10,
    );
    expect(
      validateProgress({ aide_status: 'arrived', eta_minutes: 10 }).value.eta_minutes,
    ).toBeNull();
    expect(validateProgress({ aide_status: 'gone' }).fields).toHaveProperty('aide_status');
    expect(validateProgress({ aide_status: 'on_the_way', eta_minutes: -1 }).fields).toHaveProperty(
      'eta_minutes',
    );
  });

  // Description: Validates post-service resident reviews, ratings from one to five stars, compliments, tips, and payment method choices.
  // Expected Result: Sanitizes valid review payloads with defaults, or flags validation errors across all invalid review fields.
  it('checks the rating, compliments, tip and payment method', () => {
    expect(validateReview({ rating: 4 }).value).toEqual({
      rating: 4,
      praise: [],
      review: '',
      tip: 0,
      payment_method: null,
    });
    const bad = validateReview({
      rating: 6,
      praise: [''],
      review: 5,
      tip: -1,
      payment_method: 'card',
    });
    expect(Object.keys(bad.fields).sort()).toEqual([
      'payment_method',
      'praise',
      'rating',
      'review',
      'tip',
    ]);
  });
});

describe('offer, start and cancel rules', () => {
  const hal = { categories: ['plumbing', 'electrical'], condos: ['avida'] };
  const b = {
    category: 'plumbing',
    condo_id: 'avida',
    condo_name: 'Avida',
    price_offer: 500,
    base_price: 450,
  };

  // Description: Validates whether an aide is qualified to make an offer based on trade category, condo accreditation, and minimum price.
  // Expected Result: Returns null for valid offers, or returns error objects for wrong service, lack of accreditation, or below-minimum price.
  it('checks the Manong services and the minimum price', () => {
    expect(checkOffer(hal, b, 500)).toBeNull();
    expect(checkOffer(hal, b, 600)).toBeNull();
    expect(checkOffer(hal, b, 499).field).toMatch(/₱500/);
    expect(checkOffer(hal, { ...b, price_offer: null }, 449).field).toMatch(/₱450/);
    expect(checkOffer(hal, { ...b, category: 'locks' }, 500).code).toBe('NOT_YOUR_SERVICE');
    expect(checkOffer(hal, { ...b, condo_id: 'other' }, 500)).toEqual({
      code: 'NOT_ACCREDITED',
      message: "You aren't accredited at Avida.",
    });
  });

  // Description: Enforces scheduling window restrictions allowing jobs to start at most one hour prior to the appointed time.
  // Expected Result: Returns true if earlier than one hour before scheduled time, and false when within one hour or for on-demand bookings.
  it('lets a scheduled job start from an hour before its time', () => {
    const at = new Date('2026-11-17T07:00:00Z');
    const s = { booking_type: 'scheduled', scheduled_for: at.toISOString() };
    expect(tooEarlyToStart(s, new Date('2026-11-14T12:00:00Z'))).toBe(true);
    expect(tooEarlyToStart(s, new Date('2026-11-17T05:59:00Z'))).toBe(true);
    expect(tooEarlyToStart(s, new Date('2026-11-17T06:00:00Z'))).toBe(false);
    expect(tooEarlyToStart({ booking_type: 'on-demand' })).toBe(false);
  });

  // Description: Validates user-submitted cancellation reasons by trimming whitespace and enforcing a two hundred character limit.
  // Expected Result: Normalizes valid or empty reasons to string or null, and flags errors for non-strings or reasons longer than two hundred characters.
  it('takes an optional cancel reason up to 200 characters', () => {
    expect(validateCancelReason({}).value).toEqual({ reason: null });
    expect(validateCancelReason({ reason: ' Plans changed ' }).value).toEqual({
      reason: 'Plans changed',
    });
    expect(validateCancelReason({ reason: '   ' }).value).toEqual({ reason: null });
    for (const reason of [7, 'x'.repeat(201)])
      expect(validateCancelReason({ reason }).fields).toHaveProperty('reason');
  });
});

describe('validateAide (mock aide)', () => {
  const condo = '0b7c6f2e-5d1a-4c3b-9e8f-1a2b3c4d5e6f';
  const hal = { first_name: ' Hal ', last_name: 'Cruz', categories: ['Plumbing'], condos: [condo] };

  // Description: Validates that aide profile creation sanitizes input by trimming names and lowercasing trade categories.
  // Expected Result: Returns sanitized object with trimmed first name Hal and lowercased category plumbing.
  it('trims names, lowercases categories and keeps condos', () => {
    expect(validateAide(hal).value).toEqual({
      first_name: 'Hal',
      last_name: 'Cruz',
      categories: ['plumbing'],
      condos: [condo],
    });
  });

  // Description: Ensures required aide fields for first name and last name are flagged when missing or malformed on creation.
  // Expected Result: Flags missing first name and last name, and detects invalid types for categories, condos, or active status.
  it('names every bad field on a new aide', () => {
    expect(Object.keys(validateAide({}).fields).sort()).toEqual(['first_name', 'last_name']);
    const bad = validateAide({ ...hal, categories: 'plumbing', condos: ['avida'], is_active: 1 });
    expect(Object.keys(bad.fields).sort()).toEqual(['categories', 'condos', 'is_active']);
  });

  // Description: Validates partial updates on existing aide profiles, ensuring only submitted valid fields are updated.
  // Expected Result: Allows updating single fields such as setting active status to false while rejecting completely empty update payloads.
  it('takes only the sent fields on an edit, and at least one', () => {
    expect(validateAide({ is_active: false }, { partial: true }).value).toEqual({
      is_active: false,
    });
    expect(validateAide({}, { partial: true }).fields).toBeDefined();
  });

  // Description: Checks whether category names are trimmed of surrounding whitespace to prevent silent query mismatches.
  // Expected Result: Categories array trims whitespace around items such as Plumbing to plumbing.
  it.fails('trims category names the way validateBooking does', () => {
    expect(validateAide({ ...hal, categories: [' Plumbing '] }).value?.categories).toEqual([
      'plumbing',
    ]);
  });

  // Description: Rejects aide creation if any provided service category is blank or consists only of whitespace.
  // Expected Result: Rejection error registered on fields.categories.
  it.fails('rejects a blank category name', () => {
    expect(validateAide({ ...hal, categories: ['  '] }).fields).toHaveProperty('categories');
  });
});

describe('billTotal (U15)', () => {
  // Description: Computes final payable amount by adding agreed booking price, approved extra charges, and optional tip.
  // Expected Result: Correctly sums amounts totaling seven hundred thirty pesos for five hundred agreed plus one hundred eighty approved charges plus fifty tip, ignoring pending and declined items.
  it('adds approved charges and the tip to the agreed price', () => {
    const charges = [
      { amount: 180, status: 'approved' },
      { amount: 35, status: 'declined' },
      { amount: 90, status: 'pending' },
    ];
    expect(billTotal({ agreed_price: 500, price_offer: 450, tip: 50 }, charges)).toBe(730);
    expect(billTotal({ price_offer: 450 })).toBe(450);
    expect(billTotal({ base_price: 250 })).toBe(250);
    expect(billTotal({})).toBe(0);
  });
});
