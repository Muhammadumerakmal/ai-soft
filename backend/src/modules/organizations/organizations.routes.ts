import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
} from './organizations.schemas.js';
import {
  createOrganization,
  listUserOrganizations,
  getOrganization,
  updateOrganization,
  addMember,
  removeMember,
} from './organizations.service.js';

export function organizationsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/organizations', async (request, reply) => {
    const body = createOrganizationSchema.parse(request.body);
    const org = await createOrganization(request.userId, body);
    return reply.status(201).send({ data: org });
  });

  app.get('/organizations', async (request) => {
    const orgs = await listUserOrganizations(request.userId);
    return { data: orgs };
  });

  app.get('/organizations/:orgId', async (request) => {
    const { orgId } = z.object({ orgId: z.uuid() }).parse(request.params);
    const org = await getOrganization(orgId, request.userId);
    return { data: org };
  });

  app.patch('/organizations/:orgId', async (request) => {
    const { orgId } = z.object({ orgId: z.uuid() }).parse(request.params);
    const body = updateOrganizationSchema.parse(request.body);
    const org = await updateOrganization(orgId, request.userId, body);
    return { data: org };
  });

  app.post('/organizations/:orgId/members', async (request, reply) => {
    const { orgId } = z.object({ orgId: z.uuid() }).parse(request.params);
    const body = addMemberSchema.parse(request.body);
    const member = await addMember(orgId, request.userId, body);
    return reply.status(201).send({ data: member });
  });

  app.delete('/organizations/:orgId/members/:memberId', async (request) => {
    const { orgId, memberId } = z
      .object({ orgId: z.uuid(), memberId: z.uuid() })
      .parse(request.params);
    await removeMember(orgId, request.userId, memberId);
    return { data: { message: 'Member removed' } };
  });
}
