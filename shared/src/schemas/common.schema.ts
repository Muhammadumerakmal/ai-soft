import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid UUID');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const sortSchema = z.object({
  sort: z.string().optional(),
});

export type SortInput = z.infer<typeof sortSchema>;
