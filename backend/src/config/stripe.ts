import Stripe from 'stripe';

import { logger } from '../utils/logger';

import { env } from './index';

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

if (!stripe) {
  logger.warn('STRIPE_SECRET_KEY not configured — billing features are disabled');
}
