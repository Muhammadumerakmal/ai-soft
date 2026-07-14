import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { teamRole } from '../enums';
import { teams } from './teams';
import { users } from './users';

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: teamRole('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
