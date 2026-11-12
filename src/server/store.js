// SQL for residents and bookings. Every query is parameterised. The app talks to this object only,
// so tests can swap in an in-memory store with the same methods (tests/helpers/memoryStore.js).
const RESIDENT = 'id, email, mobile_number, full_name, email_verified_at';
const BOOKING =
  'id, category, service_type, booking_type, status, scheduled_for, address, problem, price_offer, created_at, updated_at';

export function pgStore(getDb) {
  const q = async (text, params) => (await getDb().query(text, params)).rows;
  return {
    // Throws { taken: 'email' | 'mobile_number' } when the unique check fails.
    // The live table has a required, unique `username` column that the U01 spec doesn't have (ICM open
    // item 33). Nothing collects a username yet, so it is filled with the mobile number.
    async createResident({ email, mobile_number, password_hash, full_name }) {
      try {
        const rows = await q(
          `INSERT INTO residents (email, mobile_number, password_hash, full_name, username) VALUES ($1, $2::text, $3, $4, $2::text) RETURNING ${RESIDENT}`,
          [email, mobile_number, password_hash, full_name],
        );
        return rows[0];
      } catch (e) {
        if (e.code === '23505')
          throw Object.assign(new Error('duplicate resident'), {
            taken: /mobile|username/.test(String(e.constraint)) ? 'mobile_number' : 'email',
          });
        throw e;
      }
    },
    // The only method that returns password_hash. It never leaves the server.
    async findResidentForLogin({ email, mobile_number }) {
      const rows = email
        ? await q(`SELECT ${RESIDENT}, password_hash FROM residents WHERE email = $1`, [email])
        : await q(`SELECT ${RESIDENT}, password_hash FROM residents WHERE mobile_number = $1`, [
            mobile_number,
          ]);
      return rows[0] ?? null;
    },
    async findResident(id) {
      return (await q(`SELECT ${RESIDENT} FROM residents WHERE id = $1`, [id]))[0] ?? null;
    },
    async createBooking(residentId, b) {
      const rows = await q(
        `INSERT INTO bookings (resident_id, category, service_type, booking_type, status, scheduled_for, address, problem, price_offer)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ${BOOKING}`,
        [
          residentId,
          b.category,
          b.service_type,
          b.booking_type,
          b.status,
          b.scheduled_for,
          b.address,
          b.problem,
          b.price_offer,
        ],
      );
      return rows[0];
    },
    listBookings(residentId) {
      return q(
        `SELECT ${BOOKING} FROM bookings WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 100`,
        [residentId],
      );
    },
    async findBooking(residentId, id) {
      return (
        (
          await q(`SELECT ${BOOKING} FROM bookings WHERE id = $1 AND resident_id = $2`, [
            id,
            residentId,
          ])
        )[0] ?? null
      );
    },
    // Changes the status only if it is still one of `from`, so two requests can't both win.
    async setBookingStatus(residentId, id, from, to) {
      const rows = await q(
        `UPDATE bookings SET status = $4, updated_at = now() WHERE id = $1 AND resident_id = $2 AND status = ANY($3) RETURNING ${BOOKING}`,
        [id, residentId, from, to],
      );
      return rows[0] ?? null;
    },
  };
}
