-- Migration 001: residents (already live) and bookings.
-- Engine: PostgreSQL 17 on Supabase. Run once in the Supabase SQL Editor (the app role user_side
-- does not create tables). Safe to run twice: every statement is IF NOT EXISTS or idempotent.
-- PROVISIONAL: Team 2 has not confirmed either table (icm/_shared/contract/schema.md).

-- residents: the U01 spec plus the `username` column found on the live table on 2026-11-12 (open
-- item 33). It was created on 2026-11-07, so this is a no-op on the shared database and only matters
-- for a fresh one.
CREATE TABLE IF NOT EXISTS residents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(254) NOT NULL UNIQUE,
  email_verified_at TIMESTAMPTZ,
  mobile_number     VARCHAR(20)  NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  full_name         VARCHAR(100) NOT NULL,
  username          TEXT         NOT NULL UNIQUE CHECK (length(username) <= 50),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- bookings: the smallest table that holds a resident's service request.
-- service_type, booking_type and status hold the values of src/utils/contract.js as written there.
CREATE TABLE IF NOT EXISTS bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id   UUID         NOT NULL REFERENCES residents (id),
  category      VARCHAR(30)  NOT NULL,                 -- plumbing, cleaning, locks, moving. Not final (open item 8)
  service_type  VARCHAR(10)  NOT NULL CHECK (service_type IN ('CHECKUP', 'STANDARD', 'MAJOR')),
  booking_type  VARCHAR(10)  NOT NULL CHECK (booking_type IN ('on-demand', 'scheduled')),
  status        VARCHAR(24)  NOT NULL CHECK (status IN ('Requested', 'Pending Confirmation', 'Accepted',
                  'Confirmed', 'In Progress', 'Completed', 'Declined', 'Cancelled')),
  scheduled_for TIMESTAMPTZ,                           -- NULL for on-demand
  address       VARCHAR(200) NOT NULL,
  problem       VARCHAR(300) NOT NULL DEFAULT '',
  price_offer   INTEGER      CHECK (price_offer >= 0), -- pesos. Placeholder until pricing is decided (open items 6, 23)
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CHECK ((booking_type = 'scheduled') = (scheduled_for IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS bookings_resident_created_idx ON bookings (resident_id, created_at DESC);

-- Same setup as residents: owned by the app role, row level security on with no policies, so only
-- the owner (user_side) can read or write. Team 2's role needs a grant or policy once the table is agreed.
ALTER TABLE bookings OWNER TO user_side;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
