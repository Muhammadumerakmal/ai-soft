import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const projectRequirements = pgTable('project_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
