import type { Request, Response, NextFunction } from 'express';

import { env } from '../config';

import { JsonRpcErrorCode } from './types';

/**
 * Auth middleware for the MCP server. Unlike REDIS_URL (which degrades
 * gracefully when unset), MCP_API_KEY fails CLOSED: if it isn't configured
 * the server refuses every tool call rather than silently allowing
 * unauthenticated access to filesystem/shell tools.
 */
export function mcpAuth(req: Request, res: Response, next: NextFunction): void {
  if (!env.MCP_API_KEY) {
    res.status(503).json({
      jsonrpc: '2.0',
      id: (req.body as { id?: string | number })?.id ?? null,
      error: {
        code: JsonRpcErrorCode.SERVER_NOT_CONFIGURED,
        message: 'MCP server is not configured: MCP_API_KEY is not set',
      },
    });
    return;
  }

  const header = req.header('authorization') ?? req.header('Authorization');
  const expected = `Bearer ${env.MCP_API_KEY}`;

  if (!header || header !== expected) {
    res.status(401).json({
      jsonrpc: '2.0',
      id: (req.body as { id?: string | number })?.id ?? null,
      error: {
        code: JsonRpcErrorCode.UNAUTHORIZED,
        message: 'Unauthorized: missing or invalid Authorization bearer token',
      },
    });
    return;
  }

  next();
}
