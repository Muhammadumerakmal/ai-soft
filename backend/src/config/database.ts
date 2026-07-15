import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as relations from '../db/relations';
import * as tables from '../db/schema';

import { env } from './index';

const schema = { ...tables, ...relations };

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
