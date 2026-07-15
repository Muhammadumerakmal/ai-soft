import path from 'path';

/**
 * Resolves `requestedPath` against `projectRoot` and verifies the result
 * cannot escape the project root — this is the core path-traversal guard
 * used by every filesystem tool. Throws a clear error on any attempt to
 * break out of the sandbox (e.g. `../../../etc/passwd`, absolute paths
 * pointing elsewhere, symlink-style traversal via `..` segments).
 */
export function resolveSafePath(projectRoot: string, requestedPath: string): string {
  const resolvedRoot = path.resolve(projectRoot);
  const resolvedTarget = path.resolve(resolvedRoot, requestedPath);

  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    throw new Error(
      `Path traversal blocked: "${requestedPath}" resolves outside the project root`
    );
  }

  return resolvedTarget;
}

/** Commands the shell tool is permitted to execute. Nothing else is allowed. */
export const ALLOWED_COMMANDS = ['npm', 'npx', 'tsc', 'eslint', 'git', 'node'] as const;

export type AllowedCommand = (typeof ALLOWED_COMMANDS)[number];

/**
 * Shell metacharacters that would let an argument break out of an
 * `execFile` argv slot if it were ever concatenated into a shell string.
 * We never pass `shell: true`, so this is defense in depth rather than the
 * primary protection.
 */
const SHELL_METACHARACTERS = /[;|&`$()<>\n]/;

export function validateShellArg(arg: string): void {
  if (SHELL_METACHARACTERS.test(arg)) {
    throw new Error(`Argument contains disallowed shell metacharacters: ${JSON.stringify(arg)}`);
  }
}
