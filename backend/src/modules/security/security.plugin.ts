import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { logAudit } from '../audit/audit.service.js';

export async function securityPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
  });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '0');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    );
  });

  app.addHook('onResponse', async (request, reply) => {
    if (reply.statusCode >= 400 && reply.statusCode < 500) {
      const userId = (request as { userId?: string }).userId;
      if (userId) {
        await logAudit({
          userId,
          action: 'api_error',
          resource: request.url,
          details: { method: request.method, statusCode: reply.statusCode },
          ip: request.ip,
          userAgent: request.headers['user-agent'] ?? null,
        });
      }
    }
  });
}
