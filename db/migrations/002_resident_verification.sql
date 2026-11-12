-- Migration 002: verification flags on residents.
-- Requested by marn on 2026-11-13. user_side owns residents, so the app role can run this.
-- Safe to run twice. email_verified_at is kept, since Team 2 may read it; the app now uses the booleans.
-- PROVISIONAL: Team 2 has not confirmed the residents table (icm/_shared/contract/schema.md).
ALTER TABLE residents
  ADD COLUMN IF NOT EXISTS is_verified_email  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified_number BOOLEAN NOT NULL DEFAULT false;

UPDATE residents SET is_verified_email = true WHERE email_verified_at IS NOT NULL AND NOT is_verified_email;
