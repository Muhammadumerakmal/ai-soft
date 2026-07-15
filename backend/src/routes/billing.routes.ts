import { createCheckoutSessionSchema } from '@aisoftco/shared';
import { Router } from 'express';

import { BillingController } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const billingController = new BillingController();

router.use(authenticate);

router.get('/subscription', billingController.getSubscription);
router.post('/checkout', validate(createCheckoutSessionSchema), billingController.createCheckoutSession);

export default router;
