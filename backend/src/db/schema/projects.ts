import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

import { projectStatus } from '../enums';

import { teams } from './teams';
import { users } from './users';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  teamId: uuid('team_id').references(() => teams.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  techStack: jsonb('tech_stack').$type<string[]>().notNull(),
  status: projectStatus('status').default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
