// The only module that talks to the shared database. All DB access goes through here.
// shortcut: no driver or ORM yet because the engine is undecided with Team 2; add one here once it is agreed.
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  throw new Error('Database driver not configured yet');
}
