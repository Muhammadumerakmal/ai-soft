import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnv } from '../config/env.js';
import * as schema from './schema/index.js';

const env = getEnv();

const client = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type Db = typeof db;
