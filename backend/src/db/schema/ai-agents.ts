import { pgTable, uuid, varchar, text, boolean, doublePrecision, integer, timestamp } from 'drizzle-orm/pg-core';

import { agentType } from '../enums';

export const aiAgents = pgTable('ai_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  agentType: agentType('agent_type').notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  temperature: doublePrecision('temperature').default(0.3),
  maxTokens: integer('max_tokens').default(4096),
  systemPrompt: text('system_prompt'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
