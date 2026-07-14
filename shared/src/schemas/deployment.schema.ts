import { z } from 'zod';

export const DEPLOYMENT_STATUSES = [
  'pending',
  'building',
  'deploying',
  'live',
  'failed',
  'rolled_back',
] as const;

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export const createDeploymentSchema = z.object({
  projectId: z.string().uuid(),
  branch: z.string().min(1).max(255).default('main'),
  commitSha: z.string().min(1).max(64),
});

export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>;

export const deploymentResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  status: z.enum(DEPLOYMENT_STATUSES),
  url: z.string().url().nullable(),
  branch: z.string(),
  commitSha: z.string(),
  createdAt: z.string().datetime(),
});

export type DeploymentResponse = z.infer<typeof deploymentResponseSchema>;
