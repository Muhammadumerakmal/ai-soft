import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export const addMemberSchema = z.object({
  email: z.email(),
  role: z.enum(['admin', 'member']).default('member'),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
