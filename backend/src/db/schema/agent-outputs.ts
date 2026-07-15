import { pgTable, uuid, jsonb, boolean, text, timestamp } from 'drizzle-orm/pg-core';

import { agentType } from '../enums';

import { workflowSteps } from './workflow-steps';

export const agentOutputs = pgTable('agent_outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowStepId: uuid('workflow_step_id').notNull().references(() => workflowSteps.id),
  agentType: agentType('agent_type').notNull(),
  output: jsonb('output').$type<Record<string, unknown>>().notNull(),
  isValidated: boolean('is_validated').default(false),
  isApproved: boolean('is_approved'),
  approvalComment: text('approval_comment'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
