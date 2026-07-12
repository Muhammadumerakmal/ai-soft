import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { projects } from '../../db/schema/projects.js';
import { organizationMembers } from '../../db/schema/organization-members.js';
import { AppError } from '../../shared/index.js';

async function isOrgMember(orgId: string, userId: string): Promise<boolean> {
  const [member] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId)),
    )
    .limit(1);
  return !!member;
}

export async function createProject(
  userId: string,
  data: { name: string; description?: string; organizationId: string },
) {
  if (!(await isOrgMember(data.organizationId, userId))) {
    throw new AppError(403, 'FORBIDDEN', 'You are not a member of this organization');
  }

  const [project] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description,
      organizationId: data.organizationId,
      createdBy: userId,
    })
    .returning();

  if (!project) throw new AppError(500, 'PROJECT_CREATE_FAILED', 'Failed to create project');
  return project;
}

export async function listProjects(orgId: string, userId: string) {
  if (!(await isOrgMember(orgId, userId))) {
    throw new AppError(403, 'FORBIDDEN', 'You are not a member of this organization');
  }

  return db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, orgId))
    .orderBy(desc(projects.createdAt));
}

export async function getProject(projectId: string, userId: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

  if (!(await isOrgMember(project.organizationId, userId))) {
    throw new AppError(403, 'FORBIDDEN', 'You are not a member of this organization');
  }

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: { name?: string; description?: string | null; status?: 'active' | 'archived' },
) {
  await getProject(projectId, userId);

  const [updated] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Project not found');
  return updated;
}

export async function deleteProject(projectId: string, userId: string) {
  await getProject(projectId, userId);

  await db.delete(projects).where(eq(projects.id, projectId));
}
