import path from 'path';

import { z } from 'zod';

import { runCommand, truncateOutput } from '../process-utils';
import { ALLOWED_COMMANDS, resolveSafePath, validateShellArg } from '../security';

const PROJECTS_ROOT = path.resolve(__dirname, '../../../../generated');

function projectRoot(projectId: string): string {
  return path.join(PROJECTS_ROOT, projectId);
}

const HARD_TIMEOUT_MS = 30_000;
const MAX_OUTPUT_BYTES = 1024 * 1024; // 1MB per stream

export const executeCommandSchema = z.object({
  projectId: z.string().min(1),
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  timeout: z.number().int().min(1).optional(),
});

export type ExecuteCommandArgs = z.infer<typeof executeCommandSchema>;

export async function executeCommand(args: ExecuteCommandArgs) {
  if (!(ALLOWED_COMMANDS as readonly string[]).includes(args.command)) {
    throw new Error(
      `Command "${args.command}" is not allowlisted. Allowed commands: ${ALLOWED_COMMANDS.join(', ')}`
    );
  }

  for (const arg of args.args) {
    validateShellArg(arg);
  }

  const root = projectRoot(args.projectId);
  // Ensure the project directory itself resolves within the projects root
  // (it always will given how it's constructed, but this keeps the same
  // traversal guard applied consistently across every tool).
  resolveSafePath(PROJECTS_ROOT, args.projectId);

  const timeoutMs = Math.min(args.timeout ?? HARD_TIMEOUT_MS, HARD_TIMEOUT_MS);

  const result = await runCommand(args.command, args.args, {
    cwd: root,
    timeoutMs,
    maxBufferBytes: 20 * 1024 * 1024,
  });

  return {
    command: args.command,
    args: args.args,
    exitCode: result.exitCode,
    stdout: truncateOutput(result.stdout, MAX_OUTPUT_BYTES),
    stderr: truncateOutput(result.stderr, MAX_OUTPUT_BYTES),
  };
}
