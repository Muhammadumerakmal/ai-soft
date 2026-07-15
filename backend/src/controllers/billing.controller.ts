import type { Request, Response, NextFunction } from 'express';

import { BillingService } from '../services/billing.service';
import { AuthenticationError } from '../utils/errors';

const billingService = new BillingService();

export class BillingController {
  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const teamId = typeof req.query.teamId === 'string' ? req.query.teamId : undefined;
      const subscription = await billingService.getOrCreateSubscription(req.user!.id, teamId);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async createCheckoutSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.createCheckoutSession(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'];
      if (typeof signature !== 'string') {
        throw new AuthenticationError('Missing Stripe signature');
      }
      await billingService.handleWebhook(req.body as Buffer, signature);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}
