import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';

import { agentStatus } from '../enums';

import { aiAgents } from './ai-agents';
import { workflowSteps } from './workflow-steps';

export const agentExecutions = pgTable('agent_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowStepId: uuid('workflow_step_id').notNull().references(() => workflowSteps.id),
  agentId: uuid('agent_id').notNull().references(() => aiAgents.id),
  status: agentStatus('status').default('pending').notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  durationMs: integer('duration_ms'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
