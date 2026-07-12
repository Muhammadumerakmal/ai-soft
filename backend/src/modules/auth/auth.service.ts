import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/users.js';
import { organizations } from '../../db/schema/organizations.js';
import { organizationMembers } from '../../db/schema/organization-members.js';
import { eq } from 'drizzle-orm';
import { AppError } from '../../shared/index.js';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, hash: string): boolean {
  const [salt = '', key = ''] = hash.split(':');
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length > 0) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({ name: input.name, email: input.email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email });

  if (!user) throw new AppError(500, 'REGISTER_FAILED', 'Failed to create account');

  const orgSlug = (input.email.split('@')[0] ?? '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const [org] = await db
    .insert(organizations)
    .values({ name: `${input.name}'s Organization`, slug: orgSlug, ownerId: user.id })
    .returning({ id: organizations.id, name: organizations.name, slug: organizations.slug });

  if (!org) throw new AppError(500, 'ORG_CREATE_FAILED', 'Failed to create organization');

  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId: user.id,
    role: 'owner',
  });

  return { user: { id: user.id, name: user.name, email: user.email }, organization: org };
}

export async function loginUser(input: { email: string; password: string }) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!verifyPassword(input.password, user.passwordHash)) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  return { id: user.id, name: user.name, email: user.email };
}

export function generateTokenPayload(user: { id: string; email: string }) {
  return { sub: user.id, email: user.email };
}
