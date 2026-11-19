-- Full schema for a fresh database: the User Side tables and the aide tables from the proposed
-- target schema (icm/_shared/contract/future-schema.html). Admin tables are not included.
-- Applied to the "Mang Juan User Side Testing" Supabase project by Claude at marn's request on
-- 2026-11-19, because Team 2 hasn't built the aide tables yet.
--
-- Unlike migration 007 (which reshaped the shared DB), this is for an EMPTY database, so the aide_id
-- columns get real foreign keys to aide_aides. Run once, inside one transaction.
--
-- Allowed values are text + CHECK everywhere (Team 2 planned ENUMs; one style is still open).

-- ---------- Shared service catalogue (aide side) ----------
CREATE TABLE aide_service_categories (
  service_category_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(60)  NOT NULL UNIQUE,      -- the app's category key is lower(name)
  description         TEXT         NOT NULL DEFAULT '',
  sort_order          SMALLINT     NOT NULL DEFAULT 0,
  is_active           BOOLEAN      NOT NULL DEFAULT true  -- hide without breaking old bookings
);

CREATE TABLE aide_service_prices (
  service_category_id UUID          NOT NULL REFERENCES aide_service_categories (service_category_id),
  service_type        TEXT          NOT NULL CHECK (service_type IN ('CHECKUP', 'STANDARD', 'MAJOR')),
  base_price          NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  PRIMARY KEY (service_category_id, service_type)
);

-- ---------- Residents and where they live (user side) ----------
CREATE TABLE usr_residents (
  resident_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username           VARCHAR(50)  NOT NULL UNIQUE,       -- nothing collects one yet; the app stores the mobile number
  email              VARCHAR(254) NOT NULL UNIQUE,
  mobile_number      VARCHAR(20)  NOT NULL UNIQUE,       -- +639XXXXXXXXX
  password_hash      VARCHAR(255) NOT NULL,
  full_name          VARCHAR(100) NOT NULL,
  is_verified_email  BOOLEAN      NOT NULL DEFAULT false,
  is_verified_number BOOLEAN      NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Accredited condominiums: residents can only pick these; Manongs are accredited per condo.
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
  is_accredited     BOOLEAN       NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Read-only once a booking uses it: the app edits by inserting a new row and archiving the old one.
CREATE TABLE usr_resident_addresses (
  resident_address_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id         UUID         NOT NULL REFERENCES usr_residents (resident_id) ON DELETE CASCADE,
  condo_building_id   UUID         NOT NULL REFERENCES usr_condominiums (condo_building_id),
  tower               VARCHAR(40)  NOT NULL DEFAULT '',
  floor               VARCHAR(10)  NOT NULL DEFAULT '',
  unit_number         VARCHAR(20)  NOT NULL,
  notes               VARCHAR(200) NOT NULL DEFAULT '',  -- access notes: gate, parking, landmark
  is_default          BOOLEAN      NOT NULL DEFAULT false,
  is_archived         BOOLEAN      NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (resident_address_id, resident_id)              -- target of the composite FK from usr_bookings
);
CREATE INDEX usr_resident_addresses_resident_idx ON usr_resident_addresses (resident_id);
CREATE UNIQUE INDEX usr_resident_addresses_one_default ON usr_resident_addresses (resident_id)
  WHERE is_default AND NOT is_archived;

-- ---------- Manongs (aide side) ----------
CREATE TABLE aide_aides (
  aide_id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_platform         TEXT          NOT NULL DEFAULT 'password',  -- ENUM in Team 2's plan; values not agreed yet
  auth_platform_user_id VARCHAR(255),
  creation_date         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  first_name            VARCHAR(60)   NOT NULL,
  middle_name           VARCHAR(60),
  last_name             VARCHAR(60)   NOT NULL,
  suffix                VARCHAR(10),
  birthdate             DATE,
  email                 VARCHAR(254)  UNIQUE,
  phone_number          VARCHAR(20)   UNIQUE,
  password_hash         VARCHAR(255),
  is_active             BOOLEAN       NOT NULL DEFAULT true,
  last_latitude         NUMERIC(9,6)  CHECK (last_latitude BETWEEN -90 AND 90),
  last_longitude        NUMERIC(9,6)  CHECK (last_longitude BETWEEN -180 AND 180),
  last_location_ping    TIMESTAMPTZ,
  profile_photo_path    TEXT          NOT NULL DEFAULT '',
  rating                NUMERIC(2,1)  CHECK (rating BETWEEN 0 AND 5),   -- derived in Team 2's plan; stored for now
  jobs_count            INTEGER       NOT NULL DEFAULT 0 CHECK (jobs_count >= 0),
  UNIQUE (auth_platform, auth_platform_user_id)
);

CREATE TABLE aide_aides_categories (
  aide_id             UUID NOT NULL REFERENCES aide_aides (aide_id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES aide_service_categories (service_category_id),
  PRIMARY KEY (aide_id, service_category_id)
);

CREATE TABLE aide_condominium_accreditations (
  aide_id                 UUID        NOT NULL REFERENCES aide_aides (aide_id) ON DELETE CASCADE,
  condo_building_id       UUID        NOT NULL REFERENCES usr_condominiums (condo_building_id),
  accreditation_status    TEXT        NOT NULL DEFAULT 'Pending'
                            CHECK (accreditation_status IN ('Pending', 'Accredited', 'Suspended', 'Revoked')),
  accreditation_pass_code VARCHAR(64),
  PRIMARY KEY (aide_id, condo_building_id)
);
CREATE INDEX aide_condominium_accreditations_condo_idx ON aide_condominium_accreditations (condo_building_id);

-- ---------- Bookings (user side) ----------
CREATE TABLE usr_bookings (
  booking_id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id         UUID          NOT NULL REFERENCES usr_residents (resident_id),
  resident_address_id UUID          NOT NULL,
  service_category_id UUID          NOT NULL,
  service_type        TEXT          NOT NULL CHECK (service_type IN ('CHECKUP', 'STANDARD', 'MAJOR')),
  booking_type        TEXT          NOT NULL CHECK (booking_type IN ('on-demand', 'scheduled')),
  status              TEXT          NOT NULL CHECK (status IN ('Requested', 'Pending Confirmation', 'Accepted',
                        'Confirmed', 'On the way', 'Arrived', 'In Progress', 'Completed', 'Declined', 'Cancelled')),
  aide_id             UUID          REFERENCES aide_aides (aide_id),
  agreed_price        NUMERIC(10,2) CHECK (agreed_price >= 0),
  scheduled_for       TIMESTAMPTZ,
  description         TEXT          NOT NULL DEFAULT '',
  symptoms            TEXT[]        NOT NULL DEFAULT '{}',
  payment_method      TEXT          CHECK (payment_method IN ('gcash', 'cash')),
  base_price          NUMERIC(10,2) CHECK (base_price >= 0),     -- price-list snapshot at booking time
  price_offer         NUMERIC(10,2) CHECK (price_offer >= 0),    -- the resident's offer
  eta_minutes         SMALLINT      CHECK (eta_minutes BETWEEN 0 AND 600),
  cancel_reason       VARCHAR(200),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT usr_bookings_address_fk FOREIGN KEY (resident_address_id, resident_id)
    REFERENCES usr_resident_addresses (resident_address_id, resident_id),
  CONSTRAINT usr_bookings_price_fk FOREIGN KEY (service_category_id, service_type)
    REFERENCES aide_service_prices (service_category_id, service_type),
  CONSTRAINT usr_bookings_scheduled_check CHECK ((booking_type = 'scheduled') = (scheduled_for IS NOT NULL)),
  CONSTRAINT usr_bookings_cancel_reason_check CHECK (cancel_reason IS NULL OR status = 'Cancelled'),
  -- The booked Manong: required once assigned, absent while still open. Cancelled/Declined keep whoever it was.
  CONSTRAINT usr_bookings_aide_assigned_check CHECK (
    status NOT IN ('Accepted', 'Confirmed', 'On the way', 'Arrived', 'In Progress', 'Completed') OR aide_id IS NOT NULL),
  CONSTRAINT usr_bookings_aide_open_check CHECK (
    status NOT IN ('Requested', 'Pending Confirmation') OR aide_id IS NULL),
  CONSTRAINT usr_bookings_aide_price_check CHECK ((aide_id IS NULL) = (agreed_price IS NULL))
);
CREATE INDEX usr_bookings_resident_idx ON usr_bookings (resident_id, created_at DESC);
CREATE INDEX usr_bookings_aide_idx     ON usr_bookings (aide_id);
CREATE INDEX usr_bookings_address_idx  ON usr_bookings (resident_address_id);
CREATE INDEX usr_bookings_open_idx     ON usr_bookings (created_at) WHERE status IN ('Requested', 'Pending Confirmation');

-- One answer per Manong per request: take the resident's price, or counter once.
CREATE TABLE usr_booking_offers (
  booking_offer_id UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id       UUID          NOT NULL REFERENCES usr_bookings (booking_id) ON DELETE CASCADE,
  aide_id          UUID          NOT NULL REFERENCES aide_aides (aide_id),
  price            NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  kind             TEXT          NOT NULL CHECK (kind IN ('accept', 'counter')),
  -- open: waiting for the resident. expired: another offer was taken (reopens if that Manong backs out).
  status           TEXT          NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'accepted', 'declined', 'withdrawn', 'expired')),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (booking_id, aide_id)
);
CREATE UNIQUE INDEX usr_booking_offers_one_accepted ON usr_booking_offers (booking_id) WHERE status = 'accepted';
CREATE INDEX usr_booking_offers_aide_accepted_idx ON usr_booking_offers (aide_id) WHERE status = 'accepted';

CREATE TABLE usr_booking_messages (
  booking_message_id UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID         NOT NULL REFERENCES usr_bookings (booking_id) ON DELETE CASCADE,
  aide_id            UUID         NOT NULL REFERENCES aide_aides (aide_id),   -- the Manong in this thread
  sender             TEXT         NOT NULL CHECK (sender IN ('resident', 'aide')),
  body               VARCHAR(500) NOT NULL CHECK (length(body) > 0),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX usr_booking_messages_thread_idx ON usr_booking_messages (booking_id, aide_id, created_at);

-- U14 extra charges. void = cancelled because the Manong who added it backed out.
CREATE TABLE usr_booking_charges (
  booking_charge_id UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID          NOT NULL REFERENCES usr_bookings (booking_id) ON DELETE CASCADE,
  aide_id           UUID          NOT NULL REFERENCES aide_aides (aide_id),   -- who added it
  label             VARCHAR(80)   NOT NULL CHECK (length(label) > 0),
  amount            NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status            TEXT          NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'declined', 'void')),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX usr_booking_charges_booking_idx ON usr_booking_charges (booking_id);

-- One review per booking (U16).
CREATE TABLE usr_booking_reviews (
  booking_id  UUID          PRIMARY KEY REFERENCES usr_bookings (booking_id) ON DELETE CASCADE,
  rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      TEXT          NOT NULL DEFAULT '',
  tip         NUMERIC(10,2) CHECK (tip >= 0),
  reviewed_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Team 2's planned aide_reviews holds the same data as usr_booking_reviews, so it is a view over it
-- instead of a second copy. aide_review_id is the booking_id (one review per booking).
CREATE VIEW aide_reviews AS
SELECT r.booking_id AS aide_review_id, b.aide_id, r.booking_id, r.tip, r.review, r.rating
FROM usr_booking_reviews r JOIN usr_bookings b ON b.booking_id = r.booking_id;

-- ---------- Status history, written by trigger so no code path can skip it ----------
-- The app names the actor per transaction: SELECT set_config('app.actor_role', 'aide', true),
-- set_config('app.actor_id', '<uuid>', true). Unset means 'system'.
CREATE TABLE usr_booking_status_history (
  booking_status_history_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id                UUID        NOT NULL REFERENCES usr_bookings (booking_id) ON DELETE CASCADE,
  from_status               TEXT,                          -- NULL on the first row
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

-- updated_at is set by the database, not remembered by each query.
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

-- ---------- Read view for the other teams. Totals and times are computed, not stored ----------
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

-- Row level security on, no policies: only the owner and the app's server role read or write.
-- The Supabase anon/authenticated roles see nothing through the REST API.
ALTER TABLE aide_service_categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE aide_service_prices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_residents                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_condominiums                ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_resident_addresses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE aide_aides                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE aide_aides_categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE aide_condominium_accreditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_bookings                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_booking_offers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_booking_messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_booking_charges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_booking_reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE usr_booking_status_history      ENABLE ROW LEVEL SECURITY;
-- Views run with their owner's rights by default, which would skip RLS for the REST API roles.
ALTER VIEW usr_bookings_v SET (security_invoker = true);
ALTER VIEW aide_reviews   SET (security_invoker = true);

-- ---------- Reference data ----------
INSERT INTO aide_service_categories (name, description, sort_order) VALUES
  ('Plumbing',   'Leaks, clogged drains, low water pressure, toilets', 1),
  ('Electrical', 'Outlets, switches, breakers, lights and wiring',     2),
  ('Cleaning',   'Unit cleaning, deep cleaning and aircon cleaning',   3),
  ('Repairs',    'Doors, cabinets, walls, furniture and windows',      4),
  ('Locks',      'Lockouts, lock changes and smart locks',             5),
  ('Moving',     'Boxes, furniture and whole-unit moves',              6);

INSERT INTO aide_service_prices (service_category_id, service_type, base_price)
SELECT c.service_category_id, v.service_type, v.base_price
FROM (VALUES
  ('Plumbing',   'CHECKUP',  250), ('Plumbing',   'STANDARD',  450), ('Plumbing',   'MAJOR',  800),
  ('Electrical', 'CHECKUP',  300), ('Electrical', 'STANDARD',  550), ('Electrical', 'MAJOR', 1200),
  ('Cleaning',   'CHECKUP',  800), ('Cleaning',   'STANDARD', 1200), ('Cleaning',   'MAJOR', 1700),
  ('Repairs',    'CHECKUP',  400), ('Repairs',    'STANDARD',  700), ('Repairs',    'MAJOR', 1800),
  ('Locks',      'CHECKUP',  650), ('Locks',      'STANDARD',  900), ('Locks',      'MAJOR', 1500),
  ('Moving',     'CHECKUP', 1500), ('Moving',     'STANDARD', 3500), ('Moving',     'MAJOR', 6000)
) AS v (category, service_type, base_price)
JOIN aide_service_categories c ON c.name = v.category;

INSERT INTO usr_condominiums (name, street, city, province, is_accredited)
VALUES ('Avida Towers Prime Taft', 'Taft Ave', 'Pasay City', 'Metro Manila', true);

-- The 12 stand-in Manongs (DC names, no photos), each with their services and accredited at the condo.
WITH m (first_name, last_name, rating, jobs_count, categories) AS (VALUES
  ('Hal',     'Jordan', 4.9, 342, '{Plumbing,Electrical}'::text[]),
  ('Arthur',  'Curry',  4.8, 128, '{Plumbing}'),
  ('Barry',   'Allen',  4.7,  86, '{Plumbing}'),
  ('Victor',  'Stone',  4.8, 154, '{Electrical}'),
  ('James',   'Gordon', 4.9, 210, '{Cleaning}'),
  ('Barbara', 'Gordon', 4.8, 176, '{Cleaning}'),
  ('Oliver',  'Queen',  4.9, 301, '{Locks}'),
  ('Selina',  'Kyle',   4.6,  92, '{Locks}'),
  ('John',    'Jones',  4.7, 164, '{Repairs}'),
  ('Ted',     'Kord',   4.8, 118, '{Repairs}'),
  ('Wally',   'West',   4.8, 240, '{Moving}'),
  ('Roy',     'Harper', 4.7, 133, '{Moving}')
), ins AS (
  INSERT INTO aide_aides (first_name, last_name, rating, jobs_count)
  SELECT first_name, last_name, rating, jobs_count FROM m
  RETURNING aide_id, first_name, last_name
), cats AS (
  INSERT INTO aide_aides_categories (aide_id, service_category_id)
  SELECT ins.aide_id, c.service_category_id
  FROM ins JOIN m USING (first_name, last_name)
  JOIN aide_service_categories c ON c.name = ANY (m.categories)
)
INSERT INTO aide_condominium_accreditations (aide_id, condo_building_id, accreditation_status)
SELECT ins.aide_id, c.condo_building_id, 'Accredited' FROM ins CROSS JOIN usr_condominiums c;
