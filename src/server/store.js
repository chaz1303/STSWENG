// SQL for residents, saved addresses, the service catalogue, Manongs and bookings (db/schema.sql).
// Every query is parameterised. The app talks to this object only, so tests can swap in an in-memory
// store with the same methods (tests/helpers/memoryStore.js).
//
// The API keeps its old shape (id, category key, unit, address, aide_status, rating on the booking), so
// the web client didn't have to change with the schema. The mapping lives here:
//  - category key = lower(aide_service_categories.name)
//  - a "unit" is a usr_resident_addresses row; building, street and city come from its condo
//  - the database statuses On the way / Arrived show as Accepted (on-demand) or Confirmed (scheduled)
//    plus aide_status, which is what contract.js and both apps still expect
//  - rating, review and tip come from usr_booking_reviews
import { BOOKING_STATES, BOOKING_TYPES } from '../utils/contract.js';

const S = BOOKING_STATES;
const ON_THE_WAY = 'On the way';
const ARRIVED = 'Arrived';
const OPEN = [S.REQUESTED, S.PENDING_CONFIRMATION];
const ASSIGNED = [S.ACCEPTED, S.CONFIRMED, ON_THE_WAY, ARRIVED];
// A status the API showed (Accepted, Confirmed) can be On the way or Arrived in the database.
const dbStates = (list) =>
  list.some((s) => s === S.ACCEPTED || s === S.CONFIRMED) ? [...list, ON_THE_WAY, ARRIVED] : list;

const RESIDENT =
  'resident_id AS id, email, mobile_number, full_name, is_verified_email, is_verified_number';

const BOOKING_FROM = `usr_bookings b
  JOIN aide_service_categories sc ON sc.service_category_id = b.service_category_id
  JOIN usr_resident_addresses ra ON ra.resident_address_id = b.resident_address_id
  JOIN usr_condominiums co ON co.condo_building_id = ra.condo_building_id
  LEFT JOIN usr_booking_reviews rv ON rv.booking_id = b.booking_id`;
const BOOKING = `b.booking_id AS id, lower(sc.name) AS category, b.service_type, b.booking_type,
  CASE WHEN b.status IN ('${ON_THE_WAY}', '${ARRIVED}')
    THEN CASE b.booking_type WHEN '${BOOKING_TYPES.SCHEDULED}' THEN '${S.CONFIRMED}' ELSE '${S.ACCEPTED}' END
    ELSE b.status END AS status,
  b.scheduled_for,
  concat_ws(', ', 'Unit ' || ra.unit_number, 'Floor ' || nullif(ra.floor, ''), nullif(ra.tower, ''), co.name,
    nullif(co.street, ''), nullif(co.city, '')) AS address,
  b.description AS problem, b.price_offer, b.resident_address_id AS unit_id, ra.notes AS unit_notes,
  b.symptoms, b.base_price, b.payment_method, b.aide_id, b.agreed_price,
  CASE b.status WHEN '${ON_THE_WAY}' THEN 'on_the_way' WHEN '${ARRIVED}' THEN 'arrived' END AS aide_status,
  b.eta_minutes, rv.rating, rv.review, rv.tip, rv.reviewed_at, b.cancel_reason, b.created_at, b.updated_at`;

// One row per Manong in the shape the apps draw. skills and categories come from their services.
// shortcut: aggregates every aide on each use; fine for tens of Manongs, make it a view or cache past that.
const AIDES = `(SELECT a.aide_id AS id, lower(a.first_name) AS key, concat_ws(' ', a.first_name, a.last_name) AS full_name,
    coalesce(string_agg(c.name, ' & ' ORDER BY c.sort_order), '') AS skills,
    coalesce(array_agg(lower(c.name) ORDER BY c.sort_order) FILTER (WHERE c.name IS NOT NULL), '{}') AS categories,
    a.rating::float AS rating, a.jobs_count, a.profile_photo_path AS photo, NULL::text AS vehicle, a.is_active
  FROM aide_aides a
  LEFT JOIN aide_aides_categories ac ON ac.aide_id = a.aide_id
  LEFT JOIN aide_service_categories c ON c.service_category_id = ac.service_category_id
  GROUP BY a.aide_id)`;
const AIDE = 'id, key, full_name, skills, categories, rating, jobs_count, photo, vehicle';
const aideJson = (a) =>
  `CASE WHEN ${a}.id IS NULL THEN NULL ELSE json_build_object('id', ${a}.id, 'key', ${a}.key,
     'full_name', ${a}.full_name, 'skills', ${a}.skills, 'rating', ${a}.rating,
     'jobs_count', ${a}.jobs_count, 'photo', ${a}.photo, 'vehicle', ${a}.vehicle) END`;
const OFFER = 'booking_offer_id AS id, booking_id, aide_id, price, kind, status, created_at';
const CHARGE = 'booking_charge_id AS id, booking_id, aide_id, label, amount, status, created_at';
const MESSAGE = 'booking_message_id AS id, booking_id, aide_id, sender, body, created_at';

const UNIT_FROM = `usr_resident_addresses ra JOIN usr_condominiums co ON co.condo_building_id = ra.condo_building_id`;
const UNIT = `ra.resident_address_id AS id, co.name AS building, ra.tower, ra.floor, ra.unit_number, co.street,
  co.city, ra.notes, ra.is_default, ra.created_at, ra.updated_at`;
const UNIT_COLS = ['condo_building_id', 'tower', 'floor', 'unit_number', 'notes'];

const duplicate = (e) =>
  Object.assign(new Error('duplicate resident'), {
    taken: /mobile|username/.test(String(e.constraint)) ? 'mobile_number' : 'email',
  });

export function pgStore(getDb) {
  const q = async (text, params) => (await getDb().query(text, params)).rows;
  // Runs fn(query) inside one transaction on one connection. `actor` ({ role, id }) is who the
  // status-history trigger records for any status change in it.
  async function tx(fn, actor) {
    const c = await getDb().connect();
    try {
      await c.query('BEGIN');
      if (actor)
        await c.query(
          `SELECT set_config('app.actor_role', $1, true), set_config('app.actor_id', $2, true)`,
          [actor.role, actor.id ?? ''],
        );
      const out = await fn(async (text, params) => (await c.query(text, params)).rows);
      await c.query('COMMIT');
      return out;
    } catch (e) {
      await c.query('ROLLBACK');
      throw e;
    } finally {
      c.release();
    }
  }
  const one = async (text, params) => (await q(text, params))[0] ?? null;
  // One booking in the API shape, optionally only if it is this resident's.
  const get = async (run, id, residentId) =>
    (
      await run(
        `SELECT ${BOOKING} FROM ${BOOKING_FROM} WHERE b.booking_id = $1 AND ($2::uuid IS NULL OR b.resident_id = $2)`,
        [id, residentId ?? null],
      )
    )[0] ?? null;
  // Runs an UPDATE/INSERT ... RETURNING booking_id, then reads the booking back (a CTE would see the old row).
  const write = async (run, text, params, residentId) => {
    const [row] = await run(text, params);
    return row ? get(run, row.booking_id, residentId) : null;
  };
  const resident = (id) => ({ role: 'resident', id });
  const aide = (id) => ({ role: 'aide', id });
  const unitById = async (run, id) =>
    (await run(`SELECT ${UNIT} FROM ${UNIT_FROM} WHERE ra.resident_address_id = $1`, [id]))[0];

  return {
    ping: () => q('SELECT 1'),
    // Throws { taken: 'email' | 'mobile_number' } when the unique check fails.
    // usr_residents.username is required and unique, but nothing collects one yet (ICM open item 33),
    // so it is filled with the mobile number.
    async createResident({
      email,
      mobile_number,
      password_hash,
      full_name,
      is_verified_email = false,
      is_verified_number = false,
    }) {
      try {
        const rows = await q(
          `INSERT INTO usr_residents (email, mobile_number, password_hash, full_name, username, is_verified_email, is_verified_number)
           VALUES ($1, $2::text, $3, $4, $2::text, $5, $6) RETURNING ${RESIDENT}`,
          [email, mobile_number, password_hash, full_name, is_verified_email, is_verified_number],
        );
        return rows[0];
      } catch (e) {
        if (e.code === '23505') throw duplicate(e);
        throw e;
      }
    },
    // The only method that returns password_hash. It never leaves the server.
    findResidentForLogin({ email, mobile_number }) {
      return email
        ? one(`SELECT ${RESIDENT}, password_hash FROM usr_residents WHERE email = $1`, [email])
        : one(`SELECT ${RESIDENT}, password_hash FROM usr_residents WHERE mobile_number = $1`, [
            mobile_number,
          ]);
    },
    findResident(id) {
      return one(`SELECT ${RESIDENT} FROM usr_residents WHERE resident_id = $1`, [id]);
    },
    // U02. Throws { taken } like createResident. username follows the mobile number (open item 33),
    // or the old number would stay taken for the next person who registers it.
    async updateResident(id, { full_name, email, mobile_number }) {
      try {
        return await one(
          `UPDATE usr_residents SET full_name = COALESCE($2, full_name), email = COALESCE($3, email),
             mobile_number = COALESCE($4::text, mobile_number), username = COALESCE($4::text, username)
           WHERE resident_id = $1 RETURNING ${RESIDENT}`,
          [id, full_name ?? null, email ?? null, mobile_number ?? null],
        );
      } catch (e) {
        if (e.code === '23505') throw duplicate(e);
        throw e;
      }
    },

    // Accredited condos: the only buildings residents can save. Matched by name, ignoring case.
    findCondo(name) {
      return one(
        `SELECT condo_building_id AS id, name FROM usr_condominiums
         WHERE is_accredited AND lower(name) = lower($1)`,
        [name],
      );
    },
    async listCondos() {
      return (await q(`SELECT name FROM usr_condominiums WHERE is_accredited ORDER BY name`)).map(
        (r) => r.name,
      );
    },

    // U02 saved units (usr_resident_addresses). Archived ones are hidden. The default comes first.
    listUnits(residentId) {
      return q(
        `SELECT ${UNIT} FROM ${UNIT_FROM} WHERE ra.resident_id = $1 AND NOT ra.is_archived
         ORDER BY ra.is_default DESC, ra.created_at`,
        [residentId],
      );
    },
    findUnit(residentId, id) {
      return one(
        `SELECT ${UNIT} FROM ${UNIT_FROM}
         WHERE ra.resident_address_id = $1 AND ra.resident_id = $2 AND NOT ra.is_archived`,
        [id, residentId],
      );
    },
    // u.condo_building_id is already resolved by the caller. Returns null when the resident already
    // has `max` units. The first unit becomes the default.
    createUnit(residentId, u, max) {
      return tx(async (t) => {
        // Locks the resident row so two requests at once can't both pass the count.
        const [{ n }] = await t(
          `SELECT (SELECT count(*) FROM usr_resident_addresses WHERE resident_id = $1 AND NOT is_archived)::int AS n
           FROM usr_residents WHERE resident_id = $1 FOR UPDATE`,
          [residentId],
        );
        if (n >= max) return null;
        const isDefault = n === 0 || u.is_default === true;
        if (isDefault)
          await t(`UPDATE usr_resident_addresses SET is_default = false WHERE resident_id = $1`, [
            residentId,
          ]);
        const [{ id }] = await t(
          `INSERT INTO usr_resident_addresses (resident_id, ${UNIT_COLS.join(', ')}, is_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING resident_address_id AS id`,
          [residentId, ...UNIT_COLS.map((k) => u[k] ?? ''), isDefault],
        );
        return unitById(t, id);
      });
    },
    // Returns null when the unit isn't the resident's. A unit a booking already uses is never changed
    // (the booking must keep showing where the job was): it is archived and the edit becomes a new row.
    updateUnit(residentId, id, u) {
      return tx(async (t) => {
        const [old] = await t(
          `SELECT ra.*, EXISTS (SELECT 1 FROM usr_bookings b WHERE b.resident_address_id = ra.resident_address_id) AS used
           FROM usr_resident_addresses ra
           WHERE ra.resident_address_id = $1 AND ra.resident_id = $2 AND NOT ra.is_archived FOR UPDATE`,
          [id, residentId],
        );
        if (!old) return null;
        const next = { ...old, ...u };
        if (u.is_default === true)
          await t(`UPDATE usr_resident_addresses SET is_default = false WHERE resident_id = $1`, [
            residentId,
          ]);
        if (!old.used) {
          await t(
            `UPDATE usr_resident_addresses SET ${UNIT_COLS.map((k, i) => `${k} = $${i + 2}`).join(', ')}, is_default = $7
             WHERE resident_address_id = $1`,
            [id, ...UNIT_COLS.map((k) => next[k]), next.is_default],
          );
          return unitById(t, id);
        }
        await t(
          `UPDATE usr_resident_addresses SET is_archived = true, is_default = false WHERE resident_address_id = $1`,
          [id],
        );
        const [row] = await t(
          `INSERT INTO usr_resident_addresses (resident_id, ${UNIT_COLS.join(', ')}, is_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING resident_address_id AS id`,
          [residentId, ...UNIT_COLS.map((k) => next[k]), next.is_default],
        );
        return unitById(t, row.id);
      });
    },
    // Archived, never deleted: old bookings still point at it.
    async deleteUnit(residentId, id) {
      const rows = await q(
        `UPDATE usr_resident_addresses SET is_archived = true, is_default = false
         WHERE resident_address_id = $1 AND resident_id = $2 AND NOT is_archived RETURNING 1`,
        [id, residentId],
      );
      return rows.length > 0;
    },

    // U03, U06. Inactive categories are hidden from the catalogue and can't be booked.
    async listCatalog() {
      const [categories, prices] = await Promise.all([
        q(
          `SELECT lower(name) AS key, name, description FROM aide_service_categories
           WHERE is_active ORDER BY sort_order, name`,
        ),
        q(
          `SELECT lower(c.name) AS category, p.service_type, p.base_price
           FROM aide_service_prices p JOIN aide_service_categories c ON c.service_category_id = p.service_category_id`,
        ),
      ]);
      return { categories, prices };
    },
    findPrice(category, service_type) {
      return one(
        `SELECT p.base_price, p.service_category_id FROM aide_service_prices p
         JOIN aide_service_categories c ON c.service_category_id = p.service_category_id AND c.is_active
         WHERE lower(c.name) = $1 AND p.service_type = $2`,
        [category, service_type],
      );
    },

    // b.unit_id is one of the resident's saved units; b.service_category_id comes from findPrice.
    createBooking(residentId, b) {
      return tx(
        (t) =>
          write(
            t,
            `INSERT INTO usr_bookings (resident_id, resident_address_id, service_category_id, service_type, booking_type,
               status, scheduled_for, description, price_offer, symptoms, base_price, payment_method)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING booking_id`,
            [
              residentId,
              b.unit_id,
              b.service_category_id,
              b.service_type,
              b.booking_type,
              b.status,
              b.scheduled_for,
              b.problem,
              b.price_offer,
              b.symptoms,
              b.base_price,
              b.payment_method ?? null,
            ],
          ),
        resident(residentId),
      );
    },
    // U18. Each with its Manong and the approved extra charges, for history and receipts.
    listBookings(residentId) {
      return q(
        `SELECT ${BOOKING}, ${aideJson('a')} AS aide,
           (SELECT COALESCE(sum(c.amount), 0) FROM usr_booking_charges c
            WHERE c.booking_id = b.booking_id AND c.status = 'approved') AS charges_total
         FROM ${BOOKING_FROM} LEFT JOIN ${AIDES} a ON a.id = b.aide_id
         WHERE b.resident_id = $1 ORDER BY b.created_at DESC LIMIT 100`,
        [residentId],
      );
    },
    // Everything the resident app polls for one booking. Chat shows only the current Manong's thread.
    async bookingDetail(residentId, id) {
      const booking = await get(q, id, residentId);
      if (!booking) return null;
      const [aideRow, offers, charges, messages] = await Promise.all([
        booking.aide_id
          ? one(`SELECT ${AIDE} FROM ${AIDES} a WHERE a.id = $1`, [booking.aide_id])
          : null,
        q(
          `SELECT o.booking_offer_id AS id, o.price, o.kind, o.status, o.created_at, ${aideJson('a')} AS aide
           FROM usr_booking_offers o JOIN ${AIDES} a ON a.id = o.aide_id
           WHERE o.booking_id = $1 ORDER BY o.created_at`,
          [id],
        ),
        q(`SELECT ${CHARGE} FROM usr_booking_charges WHERE booking_id = $1 ORDER BY created_at`, [
          id,
        ]),
        booking.aide_id
          ? q(
              `SELECT ${MESSAGE} FROM usr_booking_messages WHERE booking_id = $1 AND aide_id = $2
               ORDER BY created_at LIMIT 200`,
              [id, booking.aide_id],
            )
          : [],
      ]);
      return { booking, aide: aideRow, offers, charges, messages };
    },
    // "Need faster arrival?": only while nobody is assigned, and only upward.
    raiseOffer(residentId, id, price) {
      return write(
        q,
        `UPDATE usr_bookings SET price_offer = $3
         WHERE booking_id = $1 AND resident_id = $2 AND aide_id IS NULL AND status = ANY($4)
           AND (price_offer IS NULL OR price_offer < $3) RETURNING booking_id`,
        [id, residentId, price, OPEN],
      );
    },
    // Takes one Manong's offer: he is assigned at his price, the other open offers expire.
    // Returns { booking } or { error: 'NOT_FOUND' | 'CLOSED' }.
    acceptOffer(residentId, bookingId, offerId) {
      return tx(async (t) => {
        const [b] = await t(
          `SELECT booking_type, status, aide_id FROM usr_bookings WHERE booking_id = $1 AND resident_id = $2 FOR UPDATE`,
          [bookingId, residentId],
        );
        const [o] = b
          ? await t(
              `SELECT aide_id, price, status FROM usr_booking_offers WHERE booking_offer_id = $1 AND booking_id = $2`,
              [offerId, bookingId],
            )
          : [];
        if (!o) return { error: 'NOT_FOUND' };
        if (b.aide_id || !OPEN.includes(b.status) || o.status !== 'open')
          return { error: 'CLOSED' };
        const to = b.booking_type === BOOKING_TYPES.SCHEDULED ? S.CONFIRMED : S.ACCEPTED;
        await t(
          `UPDATE usr_booking_offers SET status = CASE WHEN booking_offer_id = $2 THEN 'accepted' ELSE 'expired' END
           WHERE booking_id = $1 AND (booking_offer_id = $2 OR status = 'open')`,
          [bookingId, offerId],
        );
        const booking = await write(
          t,
          `UPDATE usr_bookings SET aide_id = $2, agreed_price = $3, status = $4
           WHERE booking_id = $1 RETURNING booking_id`,
          [bookingId, o.aide_id, o.price, to],
        );
        return { booking };
      }, resident(residentId));
    },
    async declineOffer(residentId, bookingId, offerId) {
      const rows = await q(
        `UPDATE usr_booking_offers o SET status = 'declined' FROM usr_bookings b
         WHERE o.booking_offer_id = $1 AND o.booking_id = $2 AND b.booking_id = o.booking_id
           AND b.resident_id = $3 AND o.status = 'open'
         RETURNING o.booking_offer_id`,
        [offerId, bookingId, residentId],
      );
      return rows.length > 0;
    },
    // U14: the resident approves or declines a pending extra charge.
    decideCharge(residentId, bookingId, chargeId, approved) {
      return one(
        `UPDATE usr_booking_charges c SET status = $4 FROM usr_bookings b
         WHERE c.booking_charge_id = $1 AND c.booking_id = $2 AND b.booking_id = c.booking_id
           AND b.resident_id = $3 AND c.status = 'pending'
         RETURNING ${CHARGE.split(', ')
           .map((k) => `c.${k}`)
           .join(', ')}`,
        [chargeId, bookingId, residentId, approved ? 'approved' : 'declined'],
      );
    },
    addMessage({ booking_id, aide_id, sender, body }) {
      return one(
        `INSERT INTO usr_booking_messages (booking_id, aide_id, sender, body) VALUES ($1, $2, $3, $4) RETURNING ${MESSAGE}`,
        [booking_id, aide_id, sender, body],
      );
    },
    // U16, U17: closes a completed booking with the rating, tip and payment method. Once only.
    // r.praise isn't stored: usr_booking_reviews has no column for it.
    saveReview(residentId, id, r) {
      return tx(async (t) => {
        const [row] = await t(
          `INSERT INTO usr_booking_reviews (booking_id, rating, review, tip)
           SELECT booking_id, $3, $4, $5 FROM usr_bookings
           WHERE booking_id = $1 AND resident_id = $2 AND status = $6
           ON CONFLICT (booking_id) DO NOTHING RETURNING booking_id`,
          [id, residentId, r.rating, r.review ?? '', r.tip, S.COMPLETED],
        );
        if (!row) return null;
        if (r.payment_method)
          await t(`UPDATE usr_bookings SET payment_method = $2 WHERE booking_id = $1`, [
            id,
            r.payment_method,
          ]);
        return get(t, id, residentId);
      }, resident(residentId));
    },
    findBooking(residentId, id) {
      return get(q, id, residentId);
    },
    // Changes the status only if it is still one of `from`, so two requests can't both win.
    // cancelReason is saved only when given (the resident's cancel).
    setBookingStatus(residentId, id, from, to, cancelReason = null) {
      return tx(
        (t) =>
          write(
            t,
            `UPDATE usr_bookings SET status = $4, cancel_reason = COALESCE($5, cancel_reason)
             WHERE booking_id = $1 AND resident_id = $2 AND status = ANY($3) RETURNING booking_id`,
            [id, residentId, dbStates(from), to, cancelReason],
            residentId,
          ),
        resident(residentId),
      );
    },

    // ---------- mock aide side (npm run mock-aide) ----------
    aideList() {
      return q(`SELECT ${AIDE} FROM ${AIDES} a WHERE a.is_active ORDER BY a.full_name`);
    },
    findAide(id) {
      return one(`SELECT ${AIDE} FROM ${AIDES} a WHERE a.id = $1 AND a.is_active`, [id]);
    },
    // Every resident's recent bookings with who, where, and each one's offers, charges and chat.
    async aideListBookings() {
      const bookings = await q(
        `SELECT ${BOOKING}, r.full_name AS resident_name, r.mobile_number AS resident_mobile, ${aideJson('a')} AS aide
         FROM ${BOOKING_FROM} JOIN usr_residents r ON r.resident_id = b.resident_id
         LEFT JOIN ${AIDES} a ON a.id = b.aide_id
         ORDER BY b.created_at DESC LIMIT 50`,
      );
      const ids = bookings.map((b) => b.id);
      const [offers, charges, messages] = await Promise.all([
        q(
          `SELECT ${OFFER} FROM usr_booking_offers WHERE booking_id = ANY($1) ORDER BY created_at`,
          [ids],
        ),
        q(
          `SELECT ${CHARGE} FROM usr_booking_charges WHERE booking_id = ANY($1) ORDER BY created_at`,
          [ids],
        ),
        q(
          `SELECT ${MESSAGE} FROM usr_booking_messages WHERE booking_id = ANY($1) ORDER BY created_at`,
          [ids],
        ),
      ]);
      const of = (rows, id) => rows.filter((r) => r.booking_id === id);
      return bookings.map((b) => ({
        ...b,
        offers: of(offers, b.id),
        charges: of(charges, b.id),
        messages: of(messages, b.id),
      }));
    },
    // Clean sweep: deletes every booking of every resident; offers, chat, charges, reviews and history
    // go with them (ON DELETE CASCADE). Residents, addresses, aides and the catalogue stay. Returns how many.
    async aideDeleteAllBookings() {
      const [{ n }] = await q(
        `WITH d AS (DELETE FROM usr_bookings RETURNING 1) SELECT count(*)::int AS n FROM d`,
      );
      return n;
    },
    aideFindBooking(id) {
      return get(q, id);
    },
    // One answer per Manong per open request. Returns null if he already answered or it closed.
    aideMakeOffer(bookingId, aideId, price, kind) {
      return one(
        `INSERT INTO usr_booking_offers (booking_id, aide_id, price, kind)
         SELECT booking_id, $2, $3, $4 FROM usr_bookings WHERE booking_id = $1 AND aide_id IS NULL AND status = ANY($5)
         ON CONFLICT (booking_id, aide_id) DO NOTHING RETURNING ${OFFER}`,
        [bookingId, aideId, price, kind, OPEN],
      );
    },
    // On the way (with ETA) or arrived: real statuses in the database. Only the assigned Manong,
    // before the job starts.
    aideSetProgress(id, aideId, { aide_status, eta_minutes }) {
      return tx(
        (t) =>
          write(
            t,
            `UPDATE usr_bookings SET status = $3, eta_minutes = $4
             WHERE booking_id = $1 AND aide_id = $2 AND status = ANY($5) RETURNING booking_id`,
            [id, aideId, aide_status === 'arrived' ? ARRIVED : ON_THE_WAY, eta_minutes, ASSIGNED],
          ),
        aide(aideId),
      );
    },
    // The assigned Manong backs out before starting: the request opens again, with the other
    // Manongs' offers back in play. His extra charges are voided so they never reach the next bill.
    aideWithdraw(id, aideId) {
      return tx(async (t) => {
        const [row] = await t(
          `UPDATE usr_bookings SET aide_id = NULL, agreed_price = NULL, eta_minutes = NULL,
             status = CASE booking_type WHEN $3 THEN $4 ELSE $5 END
           WHERE booking_id = $1 AND aide_id = $2 AND status = ANY($6) RETURNING booking_id`,
          [id, aideId, BOOKING_TYPES.SCHEDULED, S.PENDING_CONFIRMATION, S.REQUESTED, ASSIGNED],
        );
        if (!row) return null;
        await t(
          `UPDATE usr_booking_offers SET status = CASE WHEN aide_id = $2 THEN 'withdrawn' ELSE 'open' END
           WHERE booking_id = $1 AND (aide_id = $2 OR status = 'expired')`,
          [id, aideId],
        );
        await t(
          `UPDATE usr_booking_charges SET status = 'void'
           WHERE booking_id = $1 AND aide_id = $2 AND status IN ('pending', 'approved')`,
          [id, aideId],
        );
        return get(t, id);
      }, aide(aideId));
    },
    aideAddCharge(id, aideId, { label, amount }) {
      return one(
        `INSERT INTO usr_booking_charges (booking_id, aide_id, label, amount)
         SELECT booking_id, aide_id, $3, $4 FROM usr_bookings WHERE booking_id = $1 AND aide_id = $2 AND status = ANY($5)
         RETURNING ${CHARGE}`,
        [id, aideId, label, amount, [...ASSIGNED, S.IN_PROGRESS]],
      );
    },
    // Only from the status the aide saw, so a resident's cancel in between wins.
    aideSetStatus(id, from, to, aideId = null) {
      return tx(
        (t) =>
          write(
            t,
            `UPDATE usr_bookings SET status = $3 WHERE booking_id = $1 AND status = ANY($2) RETURNING booking_id`,
            [id, dbStates([from]), to],
          ),
        aide(aideId),
      );
    },
  };
}
