import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { aiConversations } from './ai-conversations';

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => aiConversations.id),
  role: varchar('role', { length: 50 }).notNull(),
  content: text('content').notNull(),
  tokens: integer('tokens'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
