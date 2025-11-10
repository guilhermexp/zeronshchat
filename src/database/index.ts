import { schema } from '@/database/schema';
import { env } from '@/lib/env';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Use SQLite for local development, PostgreSQL for production
const isLocalDev = env.ZERO_UPSTREAM_DB.endsWith('.db');

export const db = isLocalDev 
    ? drizzleSqlite(new Database(env.ZERO_UPSTREAM_DB), { schema })
    : drizzlePg(env.ZERO_UPSTREAM_DB, { schema });

export { schema };

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Database = typeof db | Transaction;
