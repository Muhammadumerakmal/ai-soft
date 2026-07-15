import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config';
import { BillingController } from './controllers/billing.controller';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { rateLimiter } from './middleware/rate-limit';
import { requestId } from './middleware/request-id';
import { requestLogger } from './middleware/request-logger';
import authRoutes from './routes/auth.routes';
import billingRoutes from './routes/billing.routes';
import healthRoutes from './routes/health.routes';
import projectRoutes from './routes/project.routes';
import teamRoutes from './routes/team.routes';
import userRoutes from './routes/user.routes';

const app = express();
const billingController = new BillingController();

// This is a JSON-only API — it never serves HTML, so a default-deny CSP is
// safe and appropriate (there's no script/style/image content to allow).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Stripe requires the raw request body to verify webhook signatures, so this
// route must be registered before the global JSON body parser.
app.post('/api/v1/billing/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  billingController.webhook(req, res, next);
});

app.use(express.json({ limit: '1mb' }));
app.use(requestId);
app.use(requestLogger);
app.use(rateLimiter);

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/billing', billingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
