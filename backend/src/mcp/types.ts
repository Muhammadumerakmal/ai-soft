/**
 * JSON-RPC 2.0 + Model Context Protocol (MCP) wire types.
 *
 * These describe the shape of requests/responses flowing over the MCP
 * server's HTTP transport (`POST /mcp/v1`). See .specs/phases/phase-04.md
 * for the protocol surface this server implements.
 */

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

export interface JsonRpcSuccessResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number;
  result: T;
}

export interface JsonRpcErrorPayload {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcErrorResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  error: JsonRpcErrorPayload;
}

export type JsonRpcResponse<T = unknown> = JsonRpcSuccessResponse<T> | JsonRpcErrorResponse;

/** Standard JSON-RPC 2.0 error codes, plus a couple of MCP-specific ones. */
export const JsonRpcErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_NOT_CONFIGURED: -32000,
  UNAUTHORIZED: -32001,
  TOOL_EXECUTION_ERROR: -32002,
} as const;

export interface McpTool {
  name: string;
  description: string;
  inputSchema: object;
}

export interface McpToolCallParams {
  name: string;
  arguments: Record<string, unknown>;
}

export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpResourceReadParams {
  uri: string;
}
