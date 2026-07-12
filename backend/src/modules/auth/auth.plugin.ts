import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

interface JwtPayload {
  sub: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
    userEmail: string;
  }
}

const authPlugin = fp((app: FastifyInstance) => {
  app.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify<JwtPayload>();
      const payload = request.user as JwtPayload;
      request.userId = payload.sub;
      request.userEmail = payload.email;
    } catch {
      reply.status(401).send({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }
  });
});

export default authPlugin;
