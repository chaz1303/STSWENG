-- Migration 007: the User Side tables move to the usr_ prefix, uuid keys and numeric money, plus
-- condominiums, saved addresses, reviews, status history and a read view for the other teams.
-- Requested by marn on 2026-11-17 after the cross-team schema meeting. Target schema:
-- icm/_shared/contract/future-schema.html (local only).
--
-- Run ONCE, inside one transaction (BEGIN ... COMMIT). A second run fails on the first statement
-- (residents no longer exists) and changes nothing.
--
-- Touches only tables user_side owns. aides (Team 2) and adm_* (Admin) are not altered:
--  - residents and bookings are renamed in place, so adm_tickets / adm_disbursements keep their FKs.
--  - the wipe uses DELETE, not TRUNCATE ... CASCADE, so it never reaches the admin tables
--    (it fails instead if an admin row points at our data).
--  - our FKs to aides are dropped; aide_id stays a plain uuid until Team 2 finalises aide_aides.

-- 1. Clean wipe of test data (marn, 2026-11-17).
DELETE FROM booking_messages;
DELETE FROM booking_charges;
DELETE FROM booking_offers;
DELETE FROM bookings;
DELETE FROM resident_units;
DELETE FROM residents;

-- 2. One service catalogue for both apps, merged from our service_categories. We create it; Team 2 owns it.
CREATE TABLE aide_service_categories (
  service_category_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(60)  NOT NULL UNIQUE,
  description         TEXT         NOT NULL DEFAULT '',
  sort_order          SMALLINT     NOT NULL DEFAULT 0,
  is_active           BOOLEAN      NOT NULL DEFAULT true    -- hide without breaking old bookings
);
INSERT INTO aide_service_categories (name, description, sort_order, is_active)
  SELECT name, description, sort_order, is_active FROM service_categories;

CREATE TABLE aide_service_prices (
  service_category_id UUID          NOT NULL REFERENCES aide_service_categories (service_category_id),
  service_type        TEXT          NOT NULL CHECK (service_type IN ('CHECKUP', 'STANDARD', 'MAJOR')),
  base_price          NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  PRIMARY KEY (service_category_id, service_type)
);
INSERT INTO aide_service_prices (service_category_id, service_type, base_price)
  SELECT c.service_category_id, p.service_type, p.base_price
  FROM service_prices p
  JOIN service_categories old ON old.key = p.category
  JOIN aide_service_categories c ON c.name = old.name;

-- 3. Accredited condominiums. Residents pick one; Manongs are accredited per condo on the aide side.
CREATE TABLE usr_condominiums (
  condo_building_id UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(120)  NOT NULL UNIQUE,
  street_number     VARCHAR(20)   NOT NULL DEFAULT '',
  street            VARCHAR(150)  NOT NULL DEFAULT '',
  barangay          VARCHAR(80)   NOT NULL DEFAULT '',
  city              VARCHAR(60)   NOT NULL DEFAULT '',
  province          VARCHAR(60)   NOT NULL DEFAULT '',
  country           VARCHAR(60)   NOT NULL DEFAULT 'Philippines',
  latitude          NUMERIC(9,6)  CHECK (latitude BETWEEN -90 AND 90),
  longitude         NUMERIC(9,6)  CHECK (longitude BETWEEN -180 AND 180),
  is_accredited     BOOLEAN       NOT NULL DEFAULT false,  -- Manongs may work here
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
-- The one condo residents had saved while testing.
INSERT INTO usr_condominiums (name, street, city, province, is_accredited)
  VALUES ('Avida Towers Prime Taft', 'Taft Ave', 'Pasay City', 'Metro Manila', true);

-- 4. Residents: renamed in place (adm_tickets.resident_id keeps pointing here).
ALTER TABLE residents RENAME TO usr_residents;
ALTER TABLE usr_residents RENAME COLUMN id TO resident_id;
ALTER TABLE usr_residents DROP COLUMN email_verified_at;   -- replaced by is_verified_email (002)

-- 5. Saved addresses: replaces resident_units. Building, street and city now come from the condo.
-- Read-only once a booking uses it: the app edits by inserting a new row and archiving the old one.
CREATE TABLE usr_resident_addresses (
  resident_address_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id         UUID         NOT NULL REFERENCES usr_residents (resident_id) ON DELETE CASCADE,
  condo_building_id   UUID         NOT NULL REFERENCES usr_condominiums (condo_building_id),
  tower               VARCHAR(40)  NOT NULL DEFAULT '',
  floor               VARCHAR(10)  NOT NULL DEFAULT '',
  unit_number         VARCHAR(20)  NOT NULL,
  notes               VARCHAR(200) NOT NULL DEFAULT '',     -- access notes: gate, parking, landmark
  is_default          BOOLEAN      NOT NULL DEFAULT false,
  is_archived         BOOLEAN      NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (resident_address_id, resident_id)                 -- target of the composite FK from usr_bookings
);
CREATE INDEX usr_resident_addresses_resident_idx ON usr_resident_addresses (resident_id);
CREATE UNIQUE INDEX usr_resident_addresses_one_default ON usr_resident_addresses (resident_id)
  WHERE is_default AND NOT is_archived;

-- 6. Booking tables: renamed in place (adm_tickets / adm_disbursements keep their FKs to bookings).
ALTER TABLE bookings         RENAME TO usr_bookings;
ALTER TABLE booking_offers   RENAME TO usr_booking_offers;
ALTER TABLE booking_messages RENAME TO usr_booking_messages;
ALTER TABLE booking_charges  RENAME TO usr_booking_charges;
ALTER TABLE usr_bookings         RENAME COLUMN id TO booking_id;
ALTER TABLE usr_booking_offers   RENAME COLUMN id TO booking_offer_id;
ALTER TABLE usr_booking_messages RENAME COLUMN id TO booking_message_id;
ALTER TABLE usr_booking_charges  RENAME COLUMN id TO booking_charge_id;

-- Drop the old CHECKs (re-added below with the new values) and every FK from our tables to aides.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conrelid::regclass AS tbl, conname FROM pg_constraint
    WHERE conrelid IN ('usr_bookings'::regclass, 'usr_booking_offers'::regclass,
                       'usr_booking_messages'::regclass, 'usr_booking_charges'::regclass)
      AND (contype = 'c' OR (contype = 'f' AND confrelid = 'aides'::regclass))
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
  END LOOP;
END $$;

-- usr_bookings: the job site and category become FKs; review fields move out; money becomes numeric.
ALTER TABLE usr_bookings
  DROP COLUMN category,
  DROP COLUMN address,
  DROP COLUMN unit_id,
  DROP COLUMN aide_status,      -- now the On the way / Arrived statuses
  DROP COLUMN rating,
  DROP COLUMN praise,
  DROP COLUMN review,
  DROP COLUMN tip,
  DROP COLUMN reviewed_at,
  ADD COLUMN resident_address_id UUID NOT NULL,
  ADD COLUMN service_category_id UUID NOT NULL,
  ALTER COLUMN service_type   TYPE TEXT,
  ALTER COLUMN booking_type   TYPE TEXT,
  ALTER COLUMN status         TYPE TEXT,
  ALTER COLUMN problem        TYPE TEXT,
  ALTER COLUMN payment_method TYPE TEXT,
  ALTER COLUMN price_offer    TYPE NUMERIC(10,2),
  ALTER COLUMN base_price     TYPE NUMERIC(10,2),
  ALTER COLUMN agreed_price   TYPE NUMERIC(10,2);
ALTER TABLE usr_bookings RENAME COLUMN problem TO description;

ALTER TABLE usr_bookings
  ADD CONSTRAINT usr_bookings_address_fk FOREIGN KEY (resident_address_id, resident_id)
    REFERENCES usr_resident_addresses (resident_address_id, resident_id),
  ADD CONSTRAINT usr_bookings_price_fk FOREIGN KEY (service_category_id, service_type)
    REFERENCES aide_service_prices (service_category_id, service_type),
  ADD CONSTRAINT usr_bookings_service_type_check CHECK (service_type IN ('CHECKUP', 'STANDARD', 'MAJOR')),
  ADD CONSTRAINT usr_bookings_booking_type_check CHECK (booking_type IN ('on-demand', 'scheduled')),
  ADD CONSTRAINT usr_bookings_status_check CHECK (status IN ('Requested', 'Pending Confirmation', 'Accepted',
    'Confirmed', 'On the way', 'Arrived', 'In Progress', 'Completed', 'Declined', 'Cancelled')),
  ADD CONSTRAINT usr_bookings_payment_method_check CHECK (payment_method IN ('gcash', 'cash')),
  ADD CONSTRAINT usr_bookings_prices_check CHECK (price_offer >= 0 AND base_price >= 0 AND agreed_price >= 0),
  ADD CONSTRAINT usr_bookings_eta_check CHECK (eta_minutes BETWEEN 0 AND 600),
  ADD CONSTRAINT usr_bookings_scheduled_check CHECK ((booking_type = 'scheduled') = (scheduled_for IS NOT NULL)),
  ADD CONSTRAINT usr_bookings_cancel_reason_check CHECK (cancel_reason IS NULL OR status = 'Cancelled'),
  -- The booked Manong: required once assigned, absent while still open. Cancelled/Declined keep whoever it was.
  ADD CONSTRAINT usr_bookings_aide_assigned_check CHECK (
    status NOT IN ('Accepted', 'Confirmed', 'On the way', 'Arrived', 'In Progress', 'Completed') OR aide_id IS NOT NULL),
  ADD CONSTRAINT usr_bookings_aide_open_check CHECK (
    status NOT IN ('Requested', 'Pending Confirmation') OR aide_id IS NULL),
  ADD CONSTRAINT usr_bookings_agreed_price_check CHECK ((aide_id IS NULL) = (agreed_price IS NULL));

CREATE INDEX usr_bookings_aide_idx    ON usr_bookings (aide_id);
CREATE INDEX usr_bookings_address_idx ON usr_bookings (resident_address_id);
CREATE INDEX usr_bookings_open_idx    ON usr_bookings (created_at) WHERE status IN ('Requested', 'Pending Confirmation');

-- usr_booking_offers
ALTER TABLE usr_booking_offers
  ALTER COLUMN price  TYPE NUMERIC(10,2),
  ALTER COLUMN kind   TYPE TEXT,
  ALTER COLUMN status TYPE TEXT,
  ADD CONSTRAINT usr_booking_offers_price_check CHECK (price >= 0),
  ADD CONSTRAINT usr_booking_offers_kind_check CHECK (kind IN ('accept', 'counter')),
  ADD CONSTRAINT usr_booking_offers_status_check
    CHECK (status IN ('open', 'accepted', 'declined', 'withdrawn', 'expired'));
CREATE UNIQUE INDEX usr_booking_offers_one_accepted ON usr_booking_offers (booking_id) WHERE status = 'accepted';
CREATE INDEX usr_booking_offers_aide_accepted_idx ON usr_booking_offers (aide_id) WHERE status = 'accepted';

-- usr_booking_messages
ALTER TABLE usr_booking_messages
  ALTER COLUMN sender TYPE TEXT,
  ADD CONSTRAINT usr_booking_messages_sender_check CHECK (sender IN ('resident', 'aide')),
  ADD CONSTRAINT usr_booking_messages_body_check CHECK (length(body) > 0);
DROP INDEX booking_messages_booking_idx;
CREATE INDEX usr_booking_messages_thread_idx ON usr_booking_messages (booking_id, aide_id, created_at);

-- usr_booking_charges: keeps aide_id (who added it); void = cancelled when that Manong backs out.
ALTER TABLE usr_booking_charges
  ALTER COLUMN amount TYPE NUMERIC(10,2),
  ALTER COLUMN status TYPE TEXT,
  ADD CONSTRAINT usr_booking_charges_amount_check CHECK (amount > 0),
  ADD CONSTRAINT usr_booking_charges_label_check CHECK (length(label) > 0),
  ADD CONSTRAINT usr_booking_charges_status_check CHECK (status IN ('pending', 'approved', 'declined', 'void'));

-- 7. Reviews: one per booking, moved off usr_bookings.
CREATE TABLE usr_booking_reviews (
  booking_id  UUID          PRIMARY KEY REFERENCES usr_bookings (booking_id) ON DELETE CASCADE,
  rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      TEXT          NOT NULL DEFAULT '',
  tip         NUMERIC(10,2) CHECK (tip >= 0),
  reviewed_at TIMESTAMPTZ   NOT NULL DEFAULT now()       -- the resident closed the job (U16)
);

-- 8. Status history: append-only, written by trigger so no code path can skip it.
-- The app names the actor per transaction: SELECT set_config('app.actor_role', 'aide', true),
-- set_config('app.actor_id', '<uuid>', true). Unset means 'system'.
CREATE TABLE usr_booking_status_history (
  booking_status_history_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id                UUID        NOT NULL REFERENCES usr_bookings (booking_id) ON DELETE CASCADE,
  from_status               TEXT,                         -- NULL on the first row
  to_status                 TEXT        NOT NULL,
  changed_by_role           TEXT        NOT NULL CHECK (changed_by_role IN ('resident', 'aide', 'admin', 'system')),
  changed_by_id             UUID,
  changed_at                TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()  -- not now(): keeps order within one transaction
);
CREATE INDEX usr_booking_status_history_booking_idx ON usr_booking_status_history (booking_id, changed_at);

CREATE FUNCTION usr_log_booking_status() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO usr_booking_status_history (booking_id, from_status, to_status, changed_by_role, changed_by_id)
  VALUES (
    NEW.booking_id,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.status END,
    NEW.status,
    coalesce(nullif(current_setting('app.actor_role', true), ''), 'system'),
    nullif(current_setting('app.actor_id', true), '')::uuid
  );
  RETURN NULL;
END $$;
CREATE TRIGGER usr_bookings_status_insert AFTER INSERT ON usr_bookings
  FOR EACH ROW EXECUTE FUNCTION usr_log_booking_status();
CREATE TRIGGER usr_bookings_status_update AFTER UPDATE OF status ON usr_bookings
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status) EXECUTE FUNCTION usr_log_booking_status();

-- 9. updated_at is set by the database, not remembered by each query.
CREATE FUNCTION usr_touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER usr_residents_touch          BEFORE UPDATE ON usr_residents          FOR EACH ROW EXECUTE FUNCTION usr_touch_updated_at();
CREATE TRIGGER usr_condominiums_touch       BEFORE UPDATE ON usr_condominiums       FOR EACH ROW EXECUTE FUNCTION usr_touch_updated_at();
CREATE TRIGGER usr_resident_addresses_touch BEFORE UPDATE ON usr_resident_addresses FOR EACH ROW EXECUTE FUNCTION usr_touch_updated_at();
CREATE TRIGGER usr_bookings_touch           BEFORE UPDATE ON usr_bookings           FOR EACH ROW EXECUTE FUNCTION usr_touch_updated_at();
CREATE TRIGGER usr_booking_offers_touch     BEFORE UPDATE ON usr_booking_offers     FOR EACH ROW EXECUTE FUNCTION usr_touch_updated_at();
CREATE TRIGGER usr_booking_charges_touch    BEFORE UPDATE ON usr_booking_charges    FOR EACH ROW EXECUTE FUNCTION usr_touch_updated_at();

-- 10. Read view: the one place Team 2 and Admin read bookings from. Totals and times are computed, not stored.
-- Grants wait for their role names (ICM open items).
CREATE VIEW usr_bookings_v AS
SELECT
  b.*,
  a.condo_building_id,
  c.name AS condo_name,
  concat_ws(', ', nullif(a.tower, ''), nullif(a.floor, ''), a.unit_number) AS unit_label,
  ch.charges_total,
  b.agreed_price + ch.charges_total AS total_amount,
  (SELECT max(h.changed_at) FROM usr_booking_status_history h
    WHERE h.booking_id = b.booking_id AND h.to_status = 'In Progress') AS started_at,
  (SELECT max(h.changed_at) FROM usr_booking_status_history h
    WHERE h.booking_id = b.booking_id AND h.to_status = 'Completed') AS completed_at
FROM usr_bookings b
JOIN usr_resident_addresses a ON a.resident_address_id = b.resident_address_id
JOIN usr_condominiums c ON c.condo_building_id = a.condo_building_id
CROSS JOIN LATERAL (
  SELECT coalesce(sum(x.amount), 0)::numeric(10,2) AS charges_total
  FROM usr_booking_charges x WHERE x.booking_id = b.booking_id AND x.status = 'approved'
) ch;

-- 11. The old tables nothing points at any more.
DROP TABLE resident_units;
DROP TABLE service_prices;
DROP TABLE service_categories;

-- Same rule as before: row level security on, no policies, so only the owner (user_side) reads or writes.
ALTER TABLE aide_service_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE aide_service_prices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_condominiums           ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_resident_addresses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_booking_reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_booking_status_history ENABLE ROW LEVEL SECURITY;
