import type { ZodTypeAny } from 'zod';

import { lintCode, lintCodeSchema, typeCheck, typeCheckSchema } from './tools/code-analysis';
import {
  resolveLibraryId,
  resolveLibraryIdSchema,
  queryDocs,
  queryDocsSchema,
} from './tools/context7';
import {
  readFile,
  readFileSchema,
  writeFile,
  writeFileSchema,
  listDirectory,
  listDirectorySchema,
  searchCode,
  searchCodeSchema,
  deleteFile,
  deleteFileSchema,
} from './tools/filesystem';
import { executeCommand, executeCommandSchema } from './tools/shell';

export interface ToolRegistryEntry {
  description: string;
  inputSchema: ZodTypeAny;
  handler: (args: unknown) => Promise<unknown>;
}

/**
 * Every MCP tool exposed by this server. `tools/list` converts each entry's
 * `inputSchema` to JSON Schema via zod-to-json-schema; `tools/call` validates
 * incoming arguments against the same schema before invoking `handler`.
 */
export const TOOL_REGISTRY: Record<string, ToolRegistryEntry> = {
  read_file: {
    description: 'Read a file within a project sandbox. Supports optional line offset/limit slicing; max 10MB.',
    inputSchema: readFileSchema,
    handler: (args) => readFile(readFileSchema.parse(args)),
  },
  write_file: {
    description:
      'Write a file within a project sandbox, creating parent directories as needed. Fails if the file already exists unless overwrite is true.',
    inputSchema: writeFileSchema,
    handler: (args) => writeFile(writeFileSchema.parse(args)),
  },
  list_directory: {
    description: 'List the entries of a directory within a project sandbox, with an optional glob/substring filter.',
    inputSchema: listDirectorySchema,
    handler: (args) => listDirectory(listDirectorySchema.parse(args)),
  },
  search_code: {
    description: 'Regex search across files under a path within a project sandbox. Guarded by a 5s timeout.',
    inputSchema: searchCodeSchema,
    handler: (args) => searchCode(searchCodeSchema.parse(args)),
  },
  delete_file: {
    description: 'Delete a file within a project sandbox.',
    inputSchema: deleteFileSchema,
    handler: (args) => deleteFile(deleteFileSchema.parse(args)),
  },
  resolve_library_id: {
    description: 'Resolve a human-readable library name/query to a Context7 library ID. Cached for 5 minutes.',
    inputSchema: resolveLibraryIdSchema,
    handler: (args) => resolveLibraryId(resolveLibraryIdSchema.parse(args)),
  },
  query_docs: {
    description: 'Query documentation for a resolved Context7 library ID. Cached for 5 minutes.',
    inputSchema: queryDocsSchema,
    handler: (args) => queryDocs(queryDocsSchema.parse(args)),
  },
  lint_code: {
    description: 'Run eslint against a path within a project sandbox, optionally auto-fixing. 30s timeout.',
    inputSchema: lintCodeSchema,
    handler: (args) => lintCode(lintCodeSchema.parse(args)),
  },
  type_check: {
    description: 'Run tsc --noEmit against a path within a project sandbox. 60s timeout.',
    inputSchema: typeCheckSchema,
    handler: (args) => typeCheck(typeCheckSchema.parse(args)),
  },
  execute_command: {
    description: `Execute an allowlisted shell command (${'npm, npx, tsc, eslint, git, node'}) within a project sandbox via execFile (no shell). 30s hard timeout cap.`,
    inputSchema: executeCommandSchema,
    handler: (args) => executeCommand(executeCommandSchema.parse(args)),
  },
};

// ---------------------------------------------------------------------------
// Tool Access Control by Agent
// Transcribed verbatim from the "Tool Access Control by Agent" table in
// .specs/phases/phase-04.md.
// ---------------------------------------------------------------------------

const FILE_READ_TOOLS = ['read_file', 'list_directory', 'search_code'];
const FILE_WRITE_TOOLS = ['write_file', 'delete_file'];
const SHELL_TOOLS = ['execute_command'];
const CONTEXT7_TOOLS = ['resolve_library_id', 'query_docs'];
const CODE_ANALYSIS_TOOLS = ['lint_code', 'type_check'];

export const AGENT_TOOL_ACL: Record<string, string[]> = {
  ceo: [...CONTEXT7_TOOLS],
  pm: [...CONTEXT7_TOOLS],
  architect: [...CONTEXT7_TOOLS],
  ui_designer: [...CONTEXT7_TOOLS],
  db_engineer: [...CONTEXT7_TOOLS],
  backend_engineer: [...FILE_READ_TOOLS, ...FILE_WRITE_TOOLS, ...SHELL_TOOLS, ...CONTEXT7_TOOLS],
  frontend_engineer: [...FILE_READ_TOOLS, ...FILE_WRITE_TOOLS, ...SHELL_TOOLS, ...CONTEXT7_TOOLS],
  qa: [...FILE_READ_TOOLS, ...SHELL_TOOLS, ...CODE_ANALYSIS_TOOLS],
  devops: [...FILE_READ_TOOLS, ...FILE_WRITE_TOOLS, ...SHELL_TOOLS],
  documentation: [...FILE_READ_TOOLS, ...FILE_WRITE_TOOLS],
};

export function canAgentUseTool(agentType: string, toolName: string): boolean {
  return AGENT_TOOL_ACL[agentType]?.includes(toolName) ?? false;
}
