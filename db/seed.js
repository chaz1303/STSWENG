// Creates or updates the demo residents, each with a saved unit at the accredited condo, so they can
// book right away. Run with `npm run seed` after db/schema.sql.
// They share one password, DEMO_PASSWORD from .env (see .env.example), never from this file or the repo.
// The numbers are made up and marked verified, so no SMS is ever sent to them.
import { getDb } from '../src/server/db.js';
import { hashPassword, validateRegister } from '../src/services/auth.js';

const RESIDENTS = [
  { full_name: 'Bruce Wayne', email: 'bruce.wayne@example.com', mobile_number: '09170000001' },
  { full_name: 'Clark Kent', email: 'clark.kent@example.com', mobile_number: '09170000002' },
  { full_name: 'Diana Prince', email: 'diana.prince@example.com', mobile_number: '09170000003' },
  // The debug "Continue with Google" account (src/server/app.js DEBUG_RESIDENT_MOBILE).
  { full_name: 'Enzo Santos', email: 'enzo.demo@example.com', mobile_number: '09175550142' },
];

const db = getDb();
try {
  for (const r of RESIDENTS) {
    const { value, fields } = validateRegister({ ...r, password: process.env.DEMO_PASSWORD });
    if (fields) {
      console.error(`Set a valid DEMO_PASSWORD in .env first.`, fields);
      process.exit(1);
    }
    // Keyed on the mobile number, so running it again resets the password instead of failing.
    const {
      rows: [{ resident_id }],
    } = await db.query(
      `INSERT INTO usr_residents (email, mobile_number, password_hash, full_name, username, is_verified_email, is_verified_number)
       VALUES ($1, $2::text, $3, $4, $2::text, true, true)
       ON CONFLICT (mobile_number) DO UPDATE
         SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name,
             is_verified_email = true, is_verified_number = true
       RETURNING resident_id`,
      [value.email, value.mobile_number, await hashPassword(value.password), value.full_name],
    );
    // One default unit, only if they have none yet.
    await db.query(
      `INSERT INTO usr_resident_addresses (resident_id, condo_building_id, tower, unit_number, is_default)
       SELECT $1, condo_building_id, 'Tower 1', $2, true FROM usr_condominiums
       WHERE name = 'Avida Towers Prime Taft'
         AND NOT EXISTS (SELECT 1 FROM usr_resident_addresses WHERE resident_id = $1 AND NOT is_archived)`,
      [resident_id, `${10 + RESIDENTS.indexOf(r)}B`],
    );
    console.log(`Ready: ${value.full_name}, ${value.mobile_number}`);
  }
} finally {
  await db.end();
}
