import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

import { billingPlan, subscriptionStatus } from '../enums';

import { teams } from './teams';
import { users } from './users';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  teamId: uuid('team_id').references(() => teams.id),
  plan: billingPlan('plan').default('free').notNull(),
  status: subscriptionStatus('status').default('active').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
