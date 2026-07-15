import { z } from 'zod';

import { env } from '../../config';

/**
 * Real 5-minute-TTL in-memory cache wrapping the (currently unavailable)
 * Context7 upstream call. The cache itself is fully functional; only
 * `fetchFromContext7` is a stub because no live Context7 credentials/API
 * access exist in this environment — it throws rather than fabricating
 * documentation results.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(method: string, args: Record<string, unknown>): string {
  return `${method}:${JSON.stringify(args)}`;
}

async function withCache<T>(method: string, args: Record<string, unknown>, fetcher: () => Promise<T>): Promise<T> {
  const key = cacheKey(method, args);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const value = await fetcher();
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

/** Clears all cached entries. Exposed for tests. */
export function clearContext7Cache(): void {
  cache.clear();
}

async function fetchFromContext7<T>(_path: string, _body: Record<string, unknown>): Promise<T> {
  if (!env.CONTEXT7_API_KEY) {
    throw new Error('Context7 integration requires CONTEXT7_API_KEY to be configured');
  }

  // TODO: once Context7 credentials are available in an environment, issue
  // the real HTTP call here, e.g.:
  //   const base = env.CONTEXT7_BASE_URL ?? 'https://api.context7.com';
  //   const res = await fetch(`${base}${_path}`, {
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${env.CONTEXT7_API_KEY}`, 'Content-Type': 'application/json' },
  //     body: JSON.stringify(_body),
  //   });
  //   if (!res.ok) throw new Error(`Context7 request failed: ${res.status} ${res.statusText}`);
  //   return (await res.json()) as T;
  throw new Error('Context7 integration requires CONTEXT7_API_KEY to be configured');
}

// ---------------------------------------------------------------------------
// resolve_library_id
// ---------------------------------------------------------------------------

export const resolveLibraryIdSchema = z.object({
  query: z.string().min(1),
  libraryName: z.string().min(1),
});

export type ResolveLibraryIdArgs = z.infer<typeof resolveLibraryIdSchema>;

export async function resolveLibraryId(args: ResolveLibraryIdArgs) {
  return withCache('resolve_library_id', args, () =>
    fetchFromContext7('/resolve-library-id', { query: args.query, libraryName: args.libraryName })
  );
}

// ---------------------------------------------------------------------------
// query_docs
// ---------------------------------------------------------------------------

export const queryDocsSchema = z.object({
  libraryId: z.string().min(1),
  query: z.string().min(1),
});

export type QueryDocsArgs = z.infer<typeof queryDocsSchema>;

export async function queryDocs(args: QueryDocsArgs) {
  return withCache('query_docs', args, () =>
    fetchFromContext7('/query-docs', { libraryId: args.libraryId, query: args.query })
  );
}
