import type { FastifyInstance } from 'fastify';
import { updateProfileSchema } from './users.schemas.js';
import { getUserProfile, updateUserProfile } from './users.service.js';

export function usersRoutes(app: FastifyInstance) {
  app.get('/users/me', { preHandler: [app.authenticate] }, async (request) => {
    const profile = await getUserProfile(request.userId);
    return { data: profile };
  });

  app.patch('/users/me', { preHandler: [app.authenticate] }, async (request) => {
    const body = updateProfileSchema.parse(request.body);
    const user = await updateUserProfile(request.userId, body);
    return { data: user };
  });
}
