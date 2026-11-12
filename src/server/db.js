// The only module that talks to the shared database. All DB access goes through here.
// Engine: PostgreSQL on Supabase (ICM open item 1). Supabase's TLS cert needs its root CA, given by DATABASE_CA_FILE.
import { readFileSync } from 'node:fs';
import pg from 'pg';

let pool;

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const caFile = process.env.DATABASE_CA_FILE;
  pool ??= new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: caFile ? { ca: readFileSync(caFile, 'utf8') } : undefined,
  });
  return pool;
}
