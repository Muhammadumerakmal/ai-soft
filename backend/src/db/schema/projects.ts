import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { users } from './users.js';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  status: text('status', { enum: ['active', 'archived'] })
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
