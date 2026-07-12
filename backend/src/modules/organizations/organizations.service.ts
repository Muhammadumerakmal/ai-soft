import { eq, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { organizations } from '../../db/schema/organizations.js';
import { organizationMembers } from '../../db/schema/organization-members.js';
import { users } from '../../db/schema/users.js';
import { AppError } from '../../shared/index.js';

async function getMemberRole(orgId: string, userId: string) {
  const [member] = await db
    .select({ role: organizationMembers.role })
    .from(organizationMembers)
    .where(
      and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId)),
    )
    .limit(1);
  return member?.role;
}

export async function createOrganization(userId: string, data: { name: string; slug: string }) {
  const existing = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, data.slug))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError(409, 'SLUG_TAKEN', 'This organization slug is already taken');
  }

  const [org] = await db
    .insert(organizations)
    .values({ name: data.name, slug: data.slug, ownerId: userId })
    .returning();

  if (!org) throw new AppError(500, 'ORG_CREATE_FAILED', 'Failed to create organization');

  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId,
    role: 'owner',
  });

  return org;
}

export async function listUserOrganizations(userId: string) {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));
}

export async function getOrganization(orgId: string, userId: string) {
  const role = await getMemberRole(orgId, userId);
  if (!role) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);

  if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, orgId));

  return { ...org, role, members };
}

export async function updateOrganization(orgId: string, userId: string, data: { name?: string }) {
  const role = await getMemberRole(orgId, userId);
  if (!role || (role !== 'owner' && role !== 'admin')) {
    throw new AppError(403, 'FORBIDDEN', 'Only owners and admins can update the organization');
  }

  const [org] = await db
    .update(organizations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizations.id, orgId))
    .returning();

  if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');
  return org;
}

export async function addMember(
  orgId: string,
  userId: string,
  data: { email: string; role: 'admin' | 'member' },
) {
  const callerRole = await getMemberRole(orgId, userId);
  if (!callerRole || (callerRole !== 'owner' && callerRole !== 'admin')) {
    throw new AppError(403, 'FORBIDDEN', 'Only owners and admins can add members');
  }

  const [newMember] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

  if (!newMember) throw new AppError(404, 'USER_NOT_FOUND', 'User with this email not found');

  const existing = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, newMember.id),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new AppError(409, 'ALREADY_MEMBER', 'User is already a member');
  }

  await db.insert(organizationMembers).values({
    organizationId: orgId,
    userId: newMember.id,
    role: data.role,
  });

  return { id: newMember.id, name: newMember.name, email: newMember.email, role: data.role };
}

export async function removeMember(orgId: string, userId: string, memberId: string) {
  const callerRole = await getMemberRole(orgId, userId);
  if (!callerRole || (callerRole !== 'owner' && callerRole !== 'admin')) {
    throw new AppError(403, 'FORBIDDEN', 'Only owners and admins can remove members');
  }

  const targetRole = await getMemberRole(orgId, memberId);
  if (targetRole === 'owner') {
    throw new AppError(403, 'FORBIDDEN', 'Cannot remove the organization owner');
  }

  await db
    .delete(organizationMembers)
    .where(
      and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, memberId)),
    );
}
