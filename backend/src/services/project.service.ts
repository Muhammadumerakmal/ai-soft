import type { CreateProjectInput, UpdateProjectInput, PaginationInput } from '@aisoftco/shared';
import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm';

import { db } from '../config/database';
import { projects } from '../db/schema';
import { OrchestratorService } from '../orchestrator';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

import { assertProjectAccess, getAccessibleTeamIds } from './project-access';
import { TeamService } from './team.service';


const orchestratorService = new OrchestratorService();
const teamService = new TeamService();

function toProjectResponse(project: typeof projects.$inferSelect) {
  return {
    id: project.id,
    userId: project.userId,
    teamId: project.teamId,
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export class ProjectService {
  async create(userId: string, input: CreateProjectInput) {
    if (input.teamId) {
      await teamService.requireMembership(userId, input.teamId, 'editor');
    }

    const [project] = await db
      .insert(projects)
      .values({
        userId,
        teamId: input.teamId,
        title: input.title,
        description: input.description,
        techStack: input.techStack,
      })
      .returning();

    if (!project) {
      throw new Error('Failed to create project');
    }

    void orchestratorService.startWorkflow(project.id).catch((error) => {
      logger.error({ error, projectId: project.id }, 'Failed to start agent pipeline for project');
    });

    return toProjectResponse(project);
  }

  async list(userId: string, pagination: PaginationInput) {
    const offset = (pagination.page - 1) * pagination.pageSize;
    const teamIds = await getAccessibleTeamIds(userId);

    const ownershipCondition = teamIds.length > 0
      ? or(eq(projects.userId, userId), inArray(projects.teamId, teamIds))
      : eq(projects.userId, userId);

    const rows = await db
      .select()
      .from(projects)
      .where(and(ownershipCondition, isNull(projects.deletedAt)))
      .orderBy(desc(projects.createdAt))
      .limit(pagination.pageSize)
      .offset(offset);

    return rows.map(toProjectResponse);
  }

  async getById(userId: string, id: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)));

    if (!project) {
      throw new NotFoundError('Project');
    }

    await assertProjectAccess(userId, project, 'viewer');

    return toProjectResponse(project);
  }

  async update(userId: string, id: string, input: UpdateProjectInput) {
    const [existing] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)));
    if (!existing) throw new NotFoundError('Project');

    await assertProjectAccess(userId, existing, 'editor');

    const [project] = await db
      .update(projects)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (!project) {
      throw new NotFoundError('Project');
    }

    return toProjectResponse(project);
  }

  async remove(userId: string, id: string) {
    const [existing] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)));
    if (!existing) throw new NotFoundError('Project');

    await assertProjectAccess(userId, existing, 'admin');

    await db.update(projects).set({ deletedAt: new Date() }).where(eq(projects.id, id));
  }
}
