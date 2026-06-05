import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export function createDB(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type DB = ReturnType<typeof createDB>;
export type { DrizzleD1Database };
export * from './schema';
