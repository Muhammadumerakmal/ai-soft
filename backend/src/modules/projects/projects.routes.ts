import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createProjectSchema, updateProjectSchema } from './projects.schemas.js';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from './projects.service.js';

export function projectsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/projects', async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    const project = await createProject(request.userId, body);
    return reply.status(201).send({ data: project });
  });

  app.get('/organizations/:orgId/projects', async (request) => {
    const { orgId } = z.object({ orgId: z.uuid() }).parse(request.params);
    const projectList = await listProjects(orgId, request.userId);
    return { data: projectList };
  });

  app.get('/projects/:projectId', async (request) => {
    const { projectId } = z.object({ projectId: z.uuid() }).parse(request.params);
    const project = await getProject(projectId, request.userId);
    return { data: project };
  });

  app.patch('/projects/:projectId', async (request) => {
    const { projectId } = z.object({ projectId: z.uuid() }).parse(request.params);
    const body = updateProjectSchema.parse(request.body);
    const project = await updateProject(projectId, request.userId, body);
    return { data: project };
  });

  app.delete('/projects/:projectId', async (request) => {
    const { projectId } = z.object({ projectId: z.uuid() }).parse(request.params);
    await deleteProject(projectId, request.userId);
    return { data: { message: 'Project deleted' } };
  });
}
