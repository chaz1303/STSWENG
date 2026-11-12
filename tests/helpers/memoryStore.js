// In-memory stand-in for src/server/store.js, so API tests never touch the shared database
// (CI plan §3.3). It keeps the same rules the SQL enforces: unique email and mobile, and a
// status change that only happens from an allowed state.
import { randomUUID } from 'node:crypto';

export function memoryStore() {
  const residents = [];
  const bookings = [];
  const without = (key) => (row) =>
    Object.fromEntries(Object.entries(row).filter(([k]) => k !== key));
  const pub = without('password_hash');
  const own = without('resident_id');
  return {
    residents,
    bookings,
    async ping() {},
    async createResident(r) {
      for (const k of ['email', 'mobile_number'])
        if (residents.some((x) => x[k] === r[k]))
          throw Object.assign(new Error('duplicate'), { taken: k });
      const row = { id: randomUUID(), email_verified_at: null, ...r };
      residents.push(row);
      return pub(row);
    },
    async findResidentForLogin({ email, mobile_number }) {
      return (
        residents.find((r) => (email ? r.email === email : r.mobile_number === mobile_number)) ??
        null
      );
    },
    async findResident(id) {
      const r = residents.find((x) => x.id === id);
      return r ? pub(r) : null;
    },
    async createBooking(resident_id, b) {
      const now = new Date().toISOString();
      const row = { id: randomUUID(), resident_id, ...b, created_at: now, updated_at: now };
      bookings.unshift(row);
      return own(row);
    },
    async listBookings(resident_id) {
      return bookings.filter((b) => b.resident_id === resident_id).map(own);
    },
    async findBooking(resident_id, id) {
      const b = bookings.find((x) => x.id === id && x.resident_id === resident_id);
      return b ? own(b) : null;
    },
    async setBookingStatus(resident_id, id, from, to) {
      const b = bookings.find(
        (x) => x.id === id && x.resident_id === resident_id && from.includes(x.status),
      );
      if (!b) return null;
      b.status = to;
      return own(b);
    },
  };
}
