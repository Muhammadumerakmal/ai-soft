import type { AgentType } from '@aisoftco/shared';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import zodToJsonSchema from 'zod-to-json-schema';

import { env } from '../config';
import { logger } from '../utils/logger';

import { mcpAuth } from './auth';
import { TOOL_REGISTRY } from './registry';
import { getAgentOutputResource, getFileResource, getProjectContextResource, type ResourceContent } from './resources';
import {
  JsonRpcErrorCode,
  type JsonRpcRequest,
  type JsonRpcResponse,
  type McpResource,
  type McpTool,
  type McpToolCallParams,
} from './types';

const PROTOCOL_VERSION = '2025-03-26';

function successResponse(id: string | number, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result };
}

function errorResponse(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data !== undefined ? { data } : {}) } };
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

const RESOURCE_TEMPLATES: McpResource[] = [
  {
    uri: 'project://{projectId}/context',
    name: 'Project Context',
    description: 'Title, description, tech stack, and status for a project',
    mimeType: 'application/json',
  },
  {
    uri: 'file://{projectId}/{path}',
    name: 'Project File',
    description: 'Contents of a file inside a project sandbox',
    mimeType: 'text/plain',
  },
  {
    uri: 'agent-output://{projectId}/{agentType?}',
    name: 'Agent Output',
    description: 'Latest completed agent output(s) for a project, optionally filtered by agent type',
    mimeType: 'application/json',
  },
];

function parseResourceUri(uri: string): { scheme: string; parts: string[] } {
  const match = /^([a-zA-Z0-9-]+):\/\/(.*)$/.exec(uri);
  if (!match) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }
  const [, scheme, rest] = match;
  return { scheme: scheme ?? '', parts: (rest ?? '').split('/').filter(Boolean) };
}

async function readResource(uri: string): Promise<ResourceContent> {
  const { scheme, parts } = parseResourceUri(uri);

  switch (scheme) {
    case 'project': {
      const [projectId] = parts;
      if (!projectId) throw new Error('project:// URI requires a projectId, e.g. project://<id>/context');
      return getProjectContextResource(projectId);
    }
    case 'file': {
      const [projectId, ...rest] = parts;
      if (!projectId || rest.length === 0) {
        throw new Error('file:// URI requires a projectId and a path, e.g. file://<id>/src/index.ts');
      }
      return getFileResource(projectId, rest.join('/'));
    }
    case 'agent-output': {
      const [projectId, agentType] = parts;
      if (!projectId) throw new Error('agent-output:// URI requires a projectId, e.g. agent-output://<id>');
      return getAgentOutputResource(projectId, agentType as AgentType | undefined);
    }
    default:
      throw new Error(`Unknown resource scheme: "${scheme}"`);
  }
}

// ---------------------------------------------------------------------------
// App factory
//
// This is a fully independent Express app — it does NOT import
// backend/src/app.ts — so it can run on its own port (MCP_PORT) with its
// own lifecycle, separate from the main API server.
// ---------------------------------------------------------------------------

export function createMcpApp(): Express {
  const app = express();

  app.use(express.json({ limit: '5mb' }));
  app.use(mcpAuth);

  app.post('/mcp/v1', async (req: Request, res: Response) => {
    const body = req.body as JsonRpcRequest;
    const id = body?.id ?? null;

    if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
      res.status(400).json(errorResponse(id, JsonRpcErrorCode.INVALID_REQUEST, 'Invalid JSON-RPC 2.0 request'));
      return;
    }

    try {
      switch (body.method) {
        case 'initialize': {
          res.json(
            successResponse(body.id, {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: { tools: {}, resources: {} },
              serverInfo: { name: 'aisoftco-mcp', version: '1.0.0' },
            })
          );
          return;
        }

        case 'tools/list': {
          const tools: McpTool[] = Object.entries(TOOL_REGISTRY).map(([name, entry]) => ({
            name,
            description: entry.description,
            inputSchema: zodToJsonSchema(entry.inputSchema, { $refStrategy: 'none', target: 'openAi' }),
          }));
          res.json(successResponse(body.id, { tools }));
          return;
        }

        case 'tools/call': {
          const params = body.params as McpToolCallParams | undefined;
          if (!params?.name) {
            res.json(errorResponse(body.id, JsonRpcErrorCode.INVALID_PARAMS, 'params.name is required'));
            return;
          }

          const entry = TOOL_REGISTRY[params.name];
          if (!entry) {
            res.json(errorResponse(body.id, JsonRpcErrorCode.METHOD_NOT_FOUND, `Unknown tool: "${params.name}"`));
            return;
          }

          const parsed = entry.inputSchema.safeParse(params.arguments ?? {});
          if (!parsed.success) {
            res.json(
              errorResponse(body.id, JsonRpcErrorCode.INVALID_PARAMS, 'Invalid tool arguments', parsed.error.flatten())
            );
            return;
          }

          try {
            const result = await entry.handler(parsed.data);
            res.json(successResponse(body.id, result));
          } catch (toolError) {
            const message = toolError instanceof Error ? toolError.message : 'Tool execution failed';
            logger.warn({ tool: params.name, error: toolError }, 'MCP tool call failed');
            res.json(errorResponse(body.id, JsonRpcErrorCode.TOOL_EXECUTION_ERROR, message));
          }
          return;
        }

        case 'resources/list': {
          res.json(successResponse(body.id, { resources: RESOURCE_TEMPLATES }));
          return;
        }

        case 'resources/read': {
          const params = body.params as { uri?: string } | undefined;
          if (!params?.uri) {
            res.json(errorResponse(body.id, JsonRpcErrorCode.INVALID_PARAMS, 'params.uri is required'));
            return;
          }
          try {
            const resource = await readResource(params.uri);
            res.json(successResponse(body.id, { contents: [resource] }));
          } catch (resourceError) {
            const message = resourceError instanceof Error ? resourceError.message : 'Failed to read resource';
            res.json(errorResponse(body.id, JsonRpcErrorCode.INTERNAL_ERROR, message));
          }
          return;
        }

        default:
          res.json(errorResponse(body.id, JsonRpcErrorCode.METHOD_NOT_FOUND, `Unknown method: "${body.method}"`));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      logger.error({ error, method: body.method }, 'MCP request handling failed');
      res.status(500).json(errorResponse(id, JsonRpcErrorCode.INTERNAL_ERROR, message));
    }
  });

  // Catches malformed JSON bodies (express.json() throws a SyntaxError before
  // our route handler ever runs) and any other uncaught error, returning a
  // valid JSON-RPC error instead of Express's default HTML error page.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, 'Unhandled MCP server error');
    res.status(400).json(errorResponse(null, JsonRpcErrorCode.PARSE_ERROR, 'Invalid request body'));
  });

  return app;
}

// NOTE: stdio transport (listed as the lowest-priority transport in
// .specs/phases/phase-04.md) is not implemented in this pass. HTTP POST
// (`/mcp/v1`) is the primary — and currently only — transport built here.

export function startMcpServer(): void {
  const app = createMcpApp();
  app.listen(env.MCP_PORT, () => {
    logger.info({ port: env.MCP_PORT }, 'MCP server started');
  });
}
