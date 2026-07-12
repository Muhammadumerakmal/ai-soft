import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/users.js';
import { organizationMembers } from '../../db/schema/organization-members.js';
import { organizations } from '../../db/schema/organizations.js';
import { AppError } from '../../shared/index.js';

export async function getUserProfile(userId: string) {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

  const orgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));

  return { ...user, organizations: orgs };
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string | null },
) {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl });

  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  return user;
}
