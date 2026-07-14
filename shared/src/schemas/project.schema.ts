import { z } from 'zod';

export const PROJECT_STATUSES = ['draft', 'running', 'completed', 'failed'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').max(10000),
  techStack: z.array(z.string()).min(1, 'At least one technology is required'),
  teamId: z.string().uuid().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(10000).optional(),
  techStack: z.array(z.string()).min(1).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  teamId: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  status: z.enum(PROJECT_STATUSES),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;
