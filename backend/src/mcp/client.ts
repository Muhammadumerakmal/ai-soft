import type { McpTool } from './types';

interface JsonRpcSuccess<T> {
  jsonrpc: '2.0';
  id: string | number;
  result: T;
}

interface JsonRpcFailure {
  jsonrpc: '2.0';
  id: string | number | null;
  error: { code: number; message: string; data?: unknown };
}

/**
 * Thin HTTP client for the standalone MCP server (backend/src/mcp/server.ts).
 *
 * TODO(integration): wire this into backend/src/orchestrator/agent-executor.ts once
 * Phase 3's parallel-stage orchestrator changes have landed - see .specs/phases/phase-04.md
 * section 4.8 "Agent Integration". Convert MCP tools to OpenAI-SDK-style function-calling
 * tool definitions there and give agent-executor.ts a tool-execution loop.
 *
 * Deliberately not imported/used anywhere yet — this file is a documented,
 * standalone wrapper only.
 */
export class McpClient {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  private async rpc<T>(method: string, params?: unknown): Promise<T> {
    const id = Math.floor(Math.random() * 1_000_000_000);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    });

    if (!response.ok && response.status !== 400) {
      // 400/401/503 responses still carry a JSON-RPC error body worth
      // surfacing; any other non-OK status (e.g. network-layer failures
      // proxied through as 5xx) is treated as a hard failure.
      throw new Error(`MCP request failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as JsonRpcSuccess<T> | JsonRpcFailure;

    if ('error' in body) {
      throw new Error(`MCP error ${body.error.code}: ${body.error.message}`);
    }

    return body.result;
  }

  async listTools(): Promise<McpTool[]> {
    const { tools } = await this.rpc<{ tools: McpTool[] }>('tools/list');
    return tools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    return this.rpc('tools/call', { name, arguments: args });
  }
}
