import fs from 'fs/promises';
import path from 'path';

import { z } from 'zod';

import { resolveSafePath } from '../security';

/**
 * Root directory under which every project's generated codebase lives.
 * This is the same `generated/` directory Phase 3's codegen service writes
 * to (repo-root/generated/<projectId>/...). It is fine for this directory
 * not to exist yet in a given environment — we only resolve the path here;
 * `write_file` is the one operation that creates it on demand.
 */
const PROJECTS_ROOT = path.resolve(__dirname, '../../../../generated');

const MAX_READ_BYTES = 10 * 1024 * 1024; // 10MB

function projectRoot(projectId: string): string {
  return path.join(PROJECTS_ROOT, projectId);
}

// ---------------------------------------------------------------------------
// read_file
// ---------------------------------------------------------------------------

export const readFileSchema = z.object({
  projectId: z.string().min(1),
  path: z.string().min(1),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).optional(),
});

export type ReadFileArgs = z.infer<typeof readFileSchema>;

export async function readFile(args: ReadFileArgs) {
  const resolved = resolveSafePath(projectRoot(args.projectId), args.path);

  const stat = await fs.stat(resolved);
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${args.path}`);
  }
  if (stat.size > MAX_READ_BYTES) {
    throw new Error(
      `File too large: ${args.path} is ${stat.size} bytes, exceeds the ${MAX_READ_BYTES} byte limit`
    );
  }

  const raw = await fs.readFile(resolved, 'utf-8');

  if (args.offset === undefined && args.limit === undefined) {
    return { path: args.path, content: raw, size: stat.size };
  }

  const lines = raw.split('\n');
  const offset = args.offset ?? 0;
  const end = args.limit !== undefined ? offset + args.limit : lines.length;
  const sliced = lines.slice(offset, end).join('\n');

  return { path: args.path, content: sliced, size: stat.size, offset, totalLines: lines.length };
}

// ---------------------------------------------------------------------------
// write_file
// ---------------------------------------------------------------------------

export const writeFileSchema = z.object({
  projectId: z.string().min(1),
  path: z.string().min(1),
  content: z.string(),
  overwrite: z.boolean().optional(),
});

export type WriteFileArgs = z.infer<typeof writeFileSchema>;

export async function writeFile(args: WriteFileArgs) {
  const resolved = resolveSafePath(projectRoot(args.projectId), args.path);

  if (!args.overwrite) {
    let alreadyExists = true;
    try {
      await fs.access(resolved);
    } catch (error) {
      // ENOENT means the file doesn't exist, which is the expected/happy path.
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        alreadyExists = false;
      } else {
        throw error;
      }
    }
    if (alreadyExists) {
      throw new Error(`File already exists: ${args.path} (pass overwrite: true to replace it)`);
    }
  }

  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, args.content, 'utf-8');

  return { path: args.path, bytesWritten: Buffer.byteLength(args.content, 'utf-8') };
}

// ---------------------------------------------------------------------------
// list_directory
// ---------------------------------------------------------------------------

export const listDirectorySchema = z.object({
  projectId: z.string().min(1),
  path: z.string().min(1).default('.'),
  pattern: z.string().optional(),
});

export type ListDirectoryArgs = z.infer<typeof listDirectorySchema>;

/** Turns a simple glob (`*`, `?`) into a RegExp; falls back to substring match. */
function patternToMatcher(pattern: string): (name: string) => boolean {
  if (!/[*?]/.test(pattern)) {
    return (name: string) => name.includes(pattern);
  }
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  const regex = new RegExp(`^${escaped}$`);
  return (name: string) => regex.test(name);
}

export async function listDirectory(args: ListDirectoryArgs) {
  const resolved = resolveSafePath(projectRoot(args.projectId), args.path);

  const entries = await fs.readdir(resolved, { withFileTypes: true });
  const matcher = args.pattern ? patternToMatcher(args.pattern) : () => true;

  const results = entries
    .filter((entry) => matcher(entry.name))
    .map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? ('directory' as const) : entry.isFile() ? ('file' as const) : ('other' as const),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { path: args.path, entries: results };
}

// ---------------------------------------------------------------------------
// search_code
// ---------------------------------------------------------------------------

export const searchCodeSchema = z.object({
  projectId: z.string().min(1),
  pattern: z.string().min(1),
  include: z.string().optional(),
  path: z.string().min(1).default('.'),
});

export type SearchCodeArgs = z.infer<typeof searchCodeSchema>;

interface SearchMatch {
  file: string;
  line: number;
  text: string;
}

const SEARCH_TIMEOUT_MS = 5000;
const MAX_SEARCH_MATCHES = 200;
const MAX_FILE_SIZE_FOR_SEARCH = 2 * 1024 * 1024; // skip anything oversized/binary-ish

async function walkFiles(root: string, includeMatcher: (name: string) => boolean): Promise<string[]> {
  const files: string[] = [];

  async function walk(dir: string) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && includeMatcher(entry.name)) {
        files.push(full);
      }
    }
  }

  await walk(root);
  return files;
}

async function performSearch(root: string, args: SearchCodeArgs): Promise<SearchMatch[]> {
  const regex = new RegExp(args.pattern);
  const includeMatcher = args.include ? patternToMatcher(args.include) : () => true;
  const files = await walkFiles(root, includeMatcher);

  const matches: SearchMatch[] = [];

  for (const file of files) {
    if (matches.length >= MAX_SEARCH_MATCHES) break;
    let stat;
    try {
      stat = await fs.stat(file);
    } catch {
      continue;
    }
    if (stat.size > MAX_FILE_SIZE_FOR_SEARCH) continue;

    let content: string;
    try {
      content = await fs.readFile(file, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (matches.length >= MAX_SEARCH_MATCHES) break;
      const line = lines[i] ?? '';
      if (regex.test(line)) {
        matches.push({ file: path.relative(root, file).replace(/\\/g, '/'), line: i + 1, text: line.trim() });
      }
    }
  }

  return matches;
}

export async function searchCode(args: SearchCodeArgs) {
  const resolved = resolveSafePath(projectRoot(args.projectId), args.path);

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`search_code timed out after ${SEARCH_TIMEOUT_MS}ms (pattern too expensive?)`)), SEARCH_TIMEOUT_MS);
  });

  const matches = await Promise.race([performSearch(resolved, args), timeout]);

  return { pattern: args.pattern, matchCount: matches.length, matches };
}

// ---------------------------------------------------------------------------
// delete_file
// ---------------------------------------------------------------------------

export const deleteFileSchema = z.object({
  projectId: z.string().min(1),
  path: z.string().min(1),
});

export type DeleteFileArgs = z.infer<typeof deleteFileSchema>;

export async function deleteFile(args: DeleteFileArgs) {
  const resolved = resolveSafePath(projectRoot(args.projectId), args.path);
  await fs.unlink(resolved);
  return { path: args.path, deleted: true };
}
