import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

import { agentType } from '../enums';

import { projects } from './projects';

export const projectFiles = pgTable('project_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  content: text('content').notNull(),
  fileType: varchar('file_type', { length: 50 }),
  category: varchar('category', { length: 50 }),
  agentType: agentType('agent_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
