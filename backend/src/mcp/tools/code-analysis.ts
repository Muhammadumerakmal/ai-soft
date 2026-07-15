import path from 'path';

import { z } from 'zod';

import { runCommand } from '../process-utils';
import { resolveSafePath } from '../security';

const PROJECTS_ROOT = path.resolve(__dirname, '../../../../generated');

function projectRoot(projectId: string): string {
  return path.join(PROJECTS_ROOT, projectId);
}

const LINT_TIMEOUT_MS = 30_000;
const TYPE_CHECK_TIMEOUT_MS = 60_000;

// ---------------------------------------------------------------------------
// lint_code
// ---------------------------------------------------------------------------

export const lintCodeSchema = z.object({
  projectId: z.string().min(1),
  path: z.string().min(1),
  fix: z.boolean().optional(),
});

export type LintCodeArgs = z.infer<typeof lintCodeSchema>;

export async function lintCode(args: LintCodeArgs) {
  const root = projectRoot(args.projectId);
  const resolved = resolveSafePath(root, args.path);

  const cliArgs = ['eslint', resolved];
  if (args.fix) cliArgs.push('--fix');

  const result = await runCommand('npx', cliArgs, { cwd: root, timeoutMs: LINT_TIMEOUT_MS });

  return {
    path: args.path,
    exitCode: result.exitCode,
    passed: result.exitCode === 0,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

// ---------------------------------------------------------------------------
// type_check
// ---------------------------------------------------------------------------

export const typeCheckSchema = z.object({
  projectId: z.string().min(1),
  path: z.string().min(1),
});

export type TypeCheckArgs = z.infer<typeof typeCheckSchema>;

export async function typeCheck(args: TypeCheckArgs) {
  const root = projectRoot(args.projectId);
  const resolved = resolveSafePath(root, args.path);

  const result = await runCommand('npx', ['tsc', '--noEmit', resolved], {
    cwd: root,
    timeoutMs: TYPE_CHECK_TIMEOUT_MS,
  });

  return {
    path: args.path,
    exitCode: result.exitCode,
    passed: result.exitCode === 0,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}
