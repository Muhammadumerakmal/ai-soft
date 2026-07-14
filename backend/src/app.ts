import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config';
import { requestId } from './middleware/request-id';
import { requestLogger } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { rateLimiter } from './middleware/rate-limit';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import userRoutes from './routes/user.routes';
import teamRoutes from './routes/team.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestId);
app.use(requestLogger);
app.use(rateLimiter);

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teams', teamRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
