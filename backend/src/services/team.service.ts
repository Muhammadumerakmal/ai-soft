import { and, eq, isNull } from 'drizzle-orm';
import type { CreateTeamInput, UpdateTeamInput, InviteMemberInput, TeamRole } from '@aisoftco/shared';
import { db } from '../config/database';
import { organizations, teams, memberships, users } from '../db/schema';
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '../utils/errors';

const ROLE_RANK: Record<TeamRole, number> = { viewer: 0, editor: 1, admin: 2, owner: 3 };

export function hasRole(actual: TeamRole, min: TeamRole): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[min];
}

function toTeamResponse(team: typeof teams.$inferSelect, role: TeamRole, memberCount: number) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    memberCount,
    role,
    createdAt: team.createdAt.toISOString(),
  };
}

function toMemberResponse(membership: typeof memberships.$inferSelect, user: typeof users.$inferSelect) {
  return {
    id: membership.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: membership.role,
    createdAt: membership.createdAt.toISOString(),
  };
}

export class TeamService {
  async getMembership(userId: string, teamId: string) {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.teamId, teamId), eq(memberships.userId, userId), isNull(memberships.deletedAt)));
    return membership ?? null;
  }

  async requireMembership(userId: string, teamId: string, minRole: TeamRole = 'viewer') {
    const membership = await this.getMembership(userId, teamId);
    if (!membership) throw new NotFoundError('Team');
    if (!hasRole(membership.role, minRole)) {
      throw new AuthorizationError(`This action requires the "${minRole}" role or higher`);
    }
    return membership;
  }

  async listMemberTeamIds(userId: string) {
    const rows = await db
      .select({ teamId: memberships.teamId })
      .from(memberships)
      .where(and(eq(memberships.userId, userId), isNull(memberships.deletedAt)));
    return rows.map((r) => r.teamId);
  }

  private async getOrCreatePersonalOrg(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new NotFoundError('User');

    const slug = `org-${userId}`;
    const [existing] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    if (existing) return existing;

    const [org] = await db.insert(organizations).values({ name: `${user.name}'s Organization`, slug }).returning();
    if (!org) throw new Error('Failed to create organization');
    return org;
  }

  private async countMembers(teamId: string) {
    const rows = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.teamId, teamId), isNull(memberships.deletedAt)));
    return rows.length;
  }

  async create(userId: string, input: CreateTeamInput) {
    const org = await this.getOrCreatePersonalOrg(userId);

    const [team] = await db
      .insert(teams)
      .values({ organizationId: org.id, name: input.name, description: input.description })
      .returning();
    if (!team) throw new Error('Failed to create team');

    await db.insert(memberships).values({ teamId: team.id, userId, role: 'owner' });

    return toTeamResponse(team, 'owner', 1);
  }

  async list(userId: string) {
    const rows = await db
      .select({ team: teams, role: memberships.role })
      .from(memberships)
      .innerJoin(teams, eq(memberships.teamId, teams.id))
      .where(and(eq(memberships.userId, userId), isNull(memberships.deletedAt), isNull(teams.deletedAt)));

    const results = [];
    for (const row of rows) {
      const memberCount = await this.countMembers(row.team.id);
      results.push(toTeamResponse(row.team, row.role, memberCount));
    }
    return results;
  }

  async getById(userId: string, teamId: string) {
    const membership = await this.requireMembership(userId, teamId, 'viewer');

    const [team] = await db.select().from(teams).where(and(eq(teams.id, teamId), isNull(teams.deletedAt)));
    if (!team) throw new NotFoundError('Team');

    const memberRows = await db
      .select({ membership: memberships, user: users })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(and(eq(memberships.teamId, teamId), isNull(memberships.deletedAt)));

    const members = memberRows.map((row) => toMemberResponse(row.membership, row.user));

    return { ...toTeamResponse(team, membership.role, members.length), members };
  }

  async update(userId: string, teamId: string, input: UpdateTeamInput) {
    const membership = await this.requireMembership(userId, teamId, 'admin');

    const [team] = await db
      .update(teams)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(teams.id, teamId))
      .returning();
    if (!team) throw new NotFoundError('Team');

    const memberCount = await this.countMembers(teamId);
    return toTeamResponse(team, membership.role, memberCount);
  }

  async inviteMember(userId: string, teamId: string, input: InviteMemberInput) {
    await this.requireMembership(userId, teamId, 'admin');

    const [targetUser] = await db.select().from(users).where(eq(users.email, input.email));
    if (!targetUser) {
      throw new NotFoundError('A user with that email');
    }

    const existing = await this.getMembership(targetUser.id, teamId);
    if (existing) {
      throw new ConflictError('User is already a member of this team');
    }

    const [membership] = await db
      .insert(memberships)
      .values({ teamId, userId: targetUser.id, role: input.role })
      .returning();
    if (!membership) throw new Error('Failed to add member');

    return toMemberResponse(membership, targetUser);
  }

  async updateMemberRole(userId: string, teamId: string, membershipId: string, role: Exclude<TeamRole, 'owner'>) {
    await this.requireMembership(userId, teamId, 'owner');

    const [target] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.id, membershipId), eq(memberships.teamId, teamId)));
    if (!target) throw new NotFoundError('Member');
    if (target.role === 'owner') {
      throw new ValidationError([{ message: "Cannot change the team owner's role" }]);
    }

    await db.update(memberships).set({ role }).where(eq(memberships.id, membershipId));
  }

  async removeMember(userId: string, teamId: string, membershipId: string) {
    await this.requireMembership(userId, teamId, 'admin');

    const [target] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.id, membershipId), eq(memberships.teamId, teamId)));
    if (!target) throw new NotFoundError('Member');
    if (target.role === 'owner') {
      throw new ValidationError([{ message: 'Cannot remove the team owner' }]);
    }

    await db.update(memberships).set({ deletedAt: new Date() }).where(eq(memberships.id, membershipId));
  }
}
