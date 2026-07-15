import type { CreateCheckoutSessionInput, BillingPlan, SubscriptionStatus } from '@aisoftco/shared';
import { and, eq, isNull } from 'drizzle-orm';
import type Stripe from 'stripe';

import { env } from '../config';
import { db } from '../config/database';
import { stripe } from '../config/stripe';
import { subscriptions, users } from '../db/schema';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';

import { TeamService } from './team.service';

const teamService = new TeamService();

const PRICE_BY_PLAN: Partial<Record<BillingPlan, string | undefined>> = {
  pro: env.STRIPE_PRICE_PRO,
  enterprise: env.STRIPE_PRICE_ENTERPRISE,
};

function toSubscriptionResponse(sub: typeof subscriptions.$inferSelect) {
  return {
    id: sub.id,
    teamId: sub.teamId,
    userId: sub.userId,
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    stripeCustomerId: sub.stripeCustomerId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
  };
}

export class BillingService {
  async getOrCreateSubscription(userId: string, teamId?: string) {
    const condition = teamId
      ? eq(subscriptions.teamId, teamId)
      : and(eq(subscriptions.userId, userId), isNull(subscriptions.teamId));

    const [existing] = await db.select().from(subscriptions).where(condition);
    if (existing) return toSubscriptionResponse(existing);

    const [created] = await db
      .insert(subscriptions)
      .values({ userId, teamId, plan: 'free', status: 'active' })
      .returning();
    if (!created) throw new Error('Failed to create subscription');
    return toSubscriptionResponse(created);
  }

  async createCheckoutSession(userId: string, input: CreateCheckoutSessionInput) {
    if (!stripe) {
      throw new AppError(503, 'BILLING_UNAVAILABLE', 'Billing is not configured on this server');
    }

    if (input.plan === 'free') {
      throw new ValidationError([{ message: 'Cannot start checkout for the free plan' }]);
    }

    if (input.teamId) {
      await teamService.requireMembership(userId, input.teamId, 'admin');
    }

    const priceId = PRICE_BY_PLAN[input.plan];
    if (!priceId) {
      throw new AppError(503, 'BILLING_UNAVAILABLE', `No Stripe price configured for the "${input.plan}" plan`);
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new NotFoundError('User');

    const subscription = await this.getOrCreateSubscription(userId, input.teamId);

    let customerId = subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      await db
        .update(subscriptions)
        .set({ stripeCustomerId: customerId })
        .where(eq(subscriptions.id, subscription.id));
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: { userId, teamId: input.teamId ?? '', plan: input.plan },
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw new AppError(503, 'BILLING_UNAVAILABLE', 'Billing webhooks are not configured');
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const plan = session.metadata?.plan as BillingPlan | undefined;
        if (!session.customer || !plan) break;

        await db
          .update(subscriptions)
          .set({
            plan,
            status: 'active',
            stripeSubscriptionId:
              typeof session.subscription === 'string' ? session.subscription : (session.subscription?.id ?? null),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, session.customer as string));
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        if (typeof sub.customer !== 'string') break;

        await db
          .update(subscriptions)
          .set({
            status: sub.status as SubscriptionStatus,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, sub.customer));
        break;
      }
      default:
        break;
    }
  }
}
