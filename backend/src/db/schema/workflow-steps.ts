import { pgTable, uuid, integer, jsonb, text, timestamp } from 'drizzle-orm/pg-core';

import { agentType, workflowStatus } from '../enums';

import { workflows } from './workflows';

export const workflowSteps = pgTable('workflow_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id),
  agentType: agentType('agent_type').notNull(),
  stepNumber: integer('step_number').notNull(),
  status: workflowStatus('status').default('pending').notNull(),
  input: jsonb('input').$type<Record<string, unknown>>(),
  output: jsonb('output').$type<Record<string, unknown>>(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
