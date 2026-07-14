import { z } from 'zod';

export const TEAM_ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(255),
  description: z.string().max(1000).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

export const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(TEAM_ROLES),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(TEAM_ROLES).exclude(['owner']),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(TEAM_ROLES).exclude(['owner']),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const teamResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  memberCount: z.number().int().nonnegative(),
  role: z.enum(TEAM_ROLES),
  createdAt: z.string().datetime(),
});

export type TeamResponse = z.infer<typeof teamResponseSchema>;

export const memberResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(TEAM_ROLES),
  createdAt: z.string().datetime(),
});

export type MemberResponse = z.infer<typeof memberResponseSchema>;

export const teamDetailResponseSchema = teamResponseSchema.extend({
  members: z.array(memberResponseSchema),
});

export type TeamDetailResponse = z.infer<typeof teamDetailResponseSchema>;
