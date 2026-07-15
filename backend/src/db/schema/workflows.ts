import { pgTable, uuid, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

import { workflowStatus, agentType } from '../enums';

import { projects } from './projects';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  status: workflowStatus('status').default('pending').notNull(),
  currentAgentType: agentType('current_agent_type'),
  currentStep: integer('current_step').default(0),
  totalSteps: integer('total_steps').default(0),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
