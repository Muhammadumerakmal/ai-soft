import type { TeamRole } from '@aisoftco/shared';
import type { projects } from '../db/schema';
import { TeamService } from './team.service';
import { NotFoundError } from '../utils/errors';

const teamService = new TeamService();

export async function assertProjectAccess(
  userId: string,
  project: typeof projects.$inferSelect,
  minRole: TeamRole = 'viewer'
) {
  if (!project.teamId) {
    if (project.userId !== userId) throw new NotFoundError('Project');
    return;
  }
  await teamService.requireMembership(userId, project.teamId, minRole);
}

export async function getAccessibleTeamIds(userId: string) {
  return teamService.listMemberTeamIds(userId);
}
