import type { FastifyInstance } from 'fastify';

export function healthRoutes(app: FastifyInstance) {
  app.get('/health', () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
