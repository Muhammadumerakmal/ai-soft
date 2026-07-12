import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { getEnv } from './config/env.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { organizationsRoutes } from './modules/organizations/organizations.routes.js';
import { projectsRoutes } from './modules/projects/projects.routes.js';
import authPlugin from './modules/auth/auth.plugin.js';
import { securityPlugin } from './modules/security/index.js';
import { errorHandler, notFoundHandler, createLoggerConfig } from './shared/index.js';

export async function buildApp() {
  const env = getEnv();
  const app = Fastify({
    logger: createLoggerConfig(env.NODE_ENV),
  });

  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(cookie);
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'token', signed: false },
  });
  await app.register(authPlugin);
  await app.register(securityPlugin);

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  await app.register(healthRoutes);
  await app.register(aiRoutes);
  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(organizationsRoutes);
  await app.register(projectsRoutes);

  return app;
}
