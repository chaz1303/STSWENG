-- Migration 006: why the resident cancelled ("Plans changed", "Fixed it myself", ...).
-- Requested by marn on 2026-11-14. Safe to run twice. NULL when no reason was picked.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(200);
