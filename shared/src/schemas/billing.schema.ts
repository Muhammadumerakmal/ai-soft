import { z } from 'zod';

export const BILLING_PLANS = ['free', 'pro', 'enterprise'] as const;
export type BillingPlan = (typeof BILLING_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const createCheckoutSessionSchema = z.object({
  plan: z.enum(BILLING_PLANS),
  teamId: z.string().uuid().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;

export const subscriptionResponseSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid().nullable(),
  userId: z.string().uuid(),
  plan: z.enum(BILLING_PLANS),
  status: z.enum(SUBSCRIPTION_STATUSES),
  currentPeriodEnd: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
});

export type SubscriptionResponse = z.infer<typeof subscriptionResponseSchema>;

export const stripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
});

export type StripeWebhookEvent = z.infer<typeof stripeWebhookEventSchema>;
