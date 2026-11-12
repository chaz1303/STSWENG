// Creates or updates the demo resident. Run with `npm run seed`.
// The credentials come from DEMO_* in .env (see .env.example), never from this file or the repo.
import { getDb } from '../src/server/db.js';
import { hashPassword, validateRegister } from '../src/services/auth.js';

const { value, fields } = validateRegister({
  email: process.env.DEMO_EMAIL,
  mobile_number: process.env.DEMO_MOBILE,
  password: process.env.DEMO_PASSWORD,
  full_name: process.env.DEMO_NAME ?? 'Enzo Santos',
});
if (fields) {
  console.error('Set DEMO_EMAIL, DEMO_MOBILE and DEMO_PASSWORD in .env first.', fields);
  process.exit(1);
}

const db = getDb();
try {
  // Keyed on the mobile number, so running it again resets the demo password instead of failing.
  await db.query(
    `INSERT INTO residents (email, mobile_number, password_hash, full_name, username) VALUES ($1, $2::text, $3, $4, $2::text)
     ON CONFLICT (mobile_number) DO UPDATE
       SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, updated_at = now()`,
    [value.email, value.mobile_number, hashPassword(value.password), value.full_name],
  );
  console.log(`Demo resident ready: ${value.full_name}, ${value.mobile_number}`);
} finally {
  await db.end();
}
