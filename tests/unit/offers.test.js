import { describe, expect, it } from 'vitest';
import {
  checkOffer,
  tooEarlyToStart,
  validateCancelReason,
  billTotal,
  validateCharge,
  validateMessage,
  validateOffer,
  validateProgress,
  validateRaise,
  validateReview,
} from '../../src/services/offers.js';

describe('offer rules', () => {
  it('takes no price as accepting, and rejects bad prices', () => {
    expect(validateOffer({ aide_id: 'a' }).value).toEqual({ aide_id: 'a', price: null });
    expect(validateOffer({ aide_id: 'a', price: 12.5 }).fields).toHaveProperty('price');
    expect(validateOffer({}).fields).toHaveProperty('aide_id');
  });
  it('raises only upward', () => {
    expect(validateRaise({ price_offer: 600 }, 500).value).toEqual({ price_offer: 600 });
    expect(validateRaise({ price_offer: 500 }, 500).fields).toBeDefined();
    expect(validateRaise({ price_offer: '600' }, null).fields).toBeDefined();
    expect(validateRaise({ price_offer: 1 }, null).value).toEqual({ price_offer: 1 });
  });
});

describe('job rules', () => {
  it('trims messages and limits them', () => {
    expect(validateMessage({ body: '  hi ' }).value).toEqual({ body: 'hi' });
    for (const body of ['', '   ', 'x'.repeat(501), 7])
      expect(validateMessage({ body }).fields).toBeDefined();
  });
  it('needs a named charge with a whole peso amount', () => {
    expect(validateCharge({ label: ' Tape ', amount: 35 }).value).toEqual({
      label: 'Tape',
      amount: 35,
    });
    expect(Object.keys(validateCharge({ amount: 0 }).fields)).toEqual(['label', 'amount']);
  });
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
  it('lets a scheduled job start from an hour before its time', () => {
    const at = new Date('2026-11-17T07:00:00Z');
    const s = { booking_type: 'scheduled', scheduled_for: at.toISOString() };
    expect(tooEarlyToStart(s, new Date('2026-11-14T12:00:00Z'))).toBe(true);
    expect(tooEarlyToStart(s, new Date('2026-11-17T05:59:00Z'))).toBe(true);
    expect(tooEarlyToStart(s, new Date('2026-11-17T06:00:00Z'))).toBe(false);
    expect(tooEarlyToStart({ booking_type: 'on-demand' })).toBe(false);
  });
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

describe('billTotal (U15)', () => {
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
