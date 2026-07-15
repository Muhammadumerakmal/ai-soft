import { execFile, type ExecFileException } from 'child_process';

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class CommandTimeoutError extends Error {
  constructor(command: string, timeoutMs: number) {
    super(`Command "${command}" timed out after ${timeoutMs}ms`);
    this.name = 'CommandTimeoutError';
  }
}

export class CommandExecutionError extends Error {
  constructor(command: string, cause: string) {
    super(`Failed to execute "${command}": ${cause}`);
    this.name = 'CommandExecutionError';
  }
}

/**
 * Runs a command via `execFile` (never a shell) with a hard timeout that
 * kills the child process if it overruns. Non-zero exit codes are returned
 * as a normal result (they represent lint/typecheck findings, not tool
 * failures) — only a timeout or a failure to even launch the process
 * (e.g. command not found) rejects the promise.
 */
export function runCommand(
  command: string,
  args: string[],
  options: { cwd: string; timeoutMs: number; maxBufferBytes?: number }
): Promise<CommandResult> {
  const maxBuffer = options.maxBufferBytes ?? 10 * 1024 * 1024;

  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { cwd: options.cwd, timeout: options.timeoutMs, maxBuffer, windowsHide: true },
      (error: ExecFileException | null, stdout, stderr) => {
        if (error) {
          if (error.killed || error.signal) {
            reject(new CommandTimeoutError(command, options.timeoutMs));
            return;
          }
          if (typeof error.code !== 'number') {
            reject(new CommandExecutionError(command, error.message));
            return;
          }
          resolve({ stdout, stderr, exitCode: error.code });
          return;
        }
        resolve({ stdout, stderr, exitCode: 0 });
      }
    );
  });
}

/** Truncates a string to `maxBytes` (UTF-8), appending a clear note if truncated. */
export function truncateOutput(value: string, maxBytes: number): string {
  const buffer = Buffer.from(value, 'utf-8');
  if (buffer.byteLength <= maxBytes) return value;
  const truncated = buffer.subarray(0, maxBytes).toString('utf-8');
  return `${truncated}\n\n[...output truncated: exceeded ${maxBytes} byte cap...]`;
}
