import { describe, expect, it } from 'vitest';
import { validateProfile } from '../../src/services/auth.js';
import { formatUnitAddress, validateUnit } from '../../src/services/units.js';

const unit = {
  building: ' Avida Towers Prime Taft ',
  tower: 'Tower 1',
  floor: '12',
  unit_number: '12B',
};

describe('validateUnit (U02)', () => {
  // Description: Validates condominium unit creation by trimming strings, requiring building and unit number, and stripping external city or street fields.
  // Expected Result: Returns trimmed building and unit number, and flags validation errors if either is missing or whitespace-only.
  it('trims a new unit and needs building and unit number', () => {
    expect(validateUnit(unit).value).toEqual({ ...unit, building: 'Avida Towers Prime Taft' });
    expect(Object.keys(validateUnit({}).fields).sort()).toEqual(['building', 'unit_number']);
    // Street and city come from the condo, so they are dropped.
    expect(validateUnit({ ...unit, street: 'Taft Ave', city: 'Pasay' }).value).not.toHaveProperty(
      'city',
    );
    expect(validateUnit({ ...unit, unit_number: '  ' }).fields).toHaveProperty('unit_number');
  });

  // Description: Enforces field length limits and type safety on optional unit properties such as notes, tower, and default flag.
  // Expected Result: Flags errors under fields.notes for over two hundred characters, fields.tower for numbers, and fields.is_default for non-booleans.
  it('limits lengths and types', () => {
    expect(validateUnit({ ...unit, notes: 'x'.repeat(201) }).fields).toHaveProperty('notes');
    expect(validateUnit({ ...unit, tower: 7 }).fields).toHaveProperty('tower');
    expect(validateUnit({ ...unit, is_default: 'yes' }).fields).toHaveProperty('is_default');
  });

  // Description: Validates partial updates on existing units, ensuring only sent fields are modified and empty update bodies are rejected.
  // Expected Result: Updates partial fields like notes Gate 2 while rejecting empty update objects or empty building strings.
  it('takes only the sent fields on an edit, and at least one', () => {
    expect(validateUnit({ notes: 'Gate 2', is_default: true }, { partial: true }).value).toEqual({
      notes: 'Gate 2',
      is_default: true,
    });
    expect(validateUnit({}, { partial: true }).fields).toBeDefined();
    expect(validateUnit({ building: '' }, { partial: true }).fields).toHaveProperty('building');
  });
});

describe('formatUnitAddress', () => {
  // Description: Formats an address string from unit components, concatenating unit, floor, tower, and building into a clean line while omitting unprovided parts.
  // Expected Result: Formats Unit 12B, Floor 12, Tower 1, Avida Towers Prime Taft, Taft Ave, Pasay City, or Unit 6, Avida when optional fields are empty.
  it('reads as one line and skips empty parts', () => {
    expect(
      formatUnitAddress({ ...validateUnit(unit).value, street: 'Taft Ave', city: 'Pasay City' }),
    ).toBe('Unit 12B, Floor 12, Tower 1, Avida Towers Prime Taft, Taft Ave, Pasay City');
    expect(formatUnitAddress({ unit_number: '6', building: 'Avida' })).toBe('Unit 6, Avida');
  });
});

describe('validateProfile (U02)', () => {
  // Description: Sanitizes resident profile updates by trimming whitespace, lowercasing emails, and normalizing Philippine mobile numbers to international format.
  // Expected Result: Normalizes email to juan@example.com and mobile to plus six three nine one seven one two three four five six seven.
  it('normalizes the fields sent', () => {
    expect(
      validateProfile({ email: ' Juan@Example.com ', mobile_number: '0917 123 4567' }),
    ).toEqual({ value: { email: 'juan@example.com', mobile_number: '+639171234567' } });
  });

  // Description: Rejects malformed profile update requests containing invalid email syntax, invalid phone numbers, empty bodies, or null input.
  // Expected Result: Flags errors across full_name, email, and mobile_number, and rejects empty or null objects with error fields.
  it('rejects bad values and an empty body', () => {
    expect(
      Object.keys(validateProfile({ full_name: '', email: 'x', mobile_number: '123' }).fields),
    ).toHaveLength(3);
    expect(validateProfile({}).fields).toBeDefined();
    expect(validateProfile(null).fields).toBeDefined();
  });
});
