# MCP Architecture

## Overview

The Model Context Protocol (MCP) server is a critical infrastructure component that provides AI agents with structured access to tools, resources, and real-time context. It follows the official MCP specification (JSON-RPC 2.0) and serves as the bridge between AI agents and the external world.

## Protocol

- **Specification:** MCP 2025-03-26
- **Transport:** HTTP with SSE (primary), stdio (development)
- **Port:** 3002 (configurable)
- **Message format:** JSON-RPC 2.0

## Architecture Diagram

```
Agent (OpenAI Agents SDK)
  → MCP Client Adapter (tool conversion)
    → HTTP/SSE Transport
      → MCP Server
        → Tool Registry
          → File System Tools
          → Context7 Tools
          → Code Analysis Tools
          → Shell Tools
        → Resource Providers
        → Auth Middleware
```

## Tool Inventory

### File System Tools

| Tool | Input | Output | Description |
|------|-------|--------|-------------|
| `read_file` | path, offset?, limit? | string | Read file contents within project |
| `write_file` | path, content, overwrite? | void | Write file, creates dirs |
| `list_directory` | path, pattern? | string[] | List files matching glob |
| `search_code` | pattern, include?, path? | Match[] | Regex search in files |
| `delete_file` | path | void | Delete file (confirmation) |

### Context7 Documentation Tools

| Tool | Input | Output | Description |
|------|-------|--------|-------------|
| `resolve_library_id` | query, libraryName | LibraryID[] | Resolve to Context7 ID |
| `query_docs` | libraryId, query | DocResult | Query library docs |

### Code Analysis Tools

| Tool | Input | Output | Description |
|------|-------|--------|-------------|
| `lint_code` | path, fix? | LintResult[] | Run ESLint |
| `type_check` | path | TypeError[] | Run tsc --noEmit |
| `analyse_complexity` | path | ComplexityReport | Cyclomatic complexity |

### Shell Tools

| Tool | Input | Output | Description |
|------|-------|--------|-------------|
| `execute_command` | command, args[], timeout? | { stdout, stderr, exitCode } | Run whitelisted command |

**Allowed commands:** npm, npx, node, git, ls, cat

## Security Controls

| Control | Implementation |
|---------|---------------|
| Path traversal prevention | `resolveSafePath()` normalises + validates within project root |
| Command allowlist | Only 6 whitelisted commands |
| Command injection prevention | Parameterised execution, no pipes/semicolons/subshells |
| File size limit | Max 10MB per read/write |
| Rate limiting | 60 tool calls/min per agent session |
| Authentication | Bearer token (`MCP_API_KEY`) |
| Audit logging | All tool calls logged with agent ID, timestamp, params |

## Resources

| URI Template | Description |
|-------------|-------------|
| `mcp://project/{projectId}/context` | Current project state |
| `mcp://project/{projectId}/files/{filePath}` | Generated file content |
| `mcp://project/{projectId}/outputs/{agentType}` | Latest agent output |

## MCP Server Structure

```
backend/src/mcp/
  index.ts              # Entry point
  server.ts             # Protocol handler (JSON-RPC dispatch)
  client.ts             # Orchestrator-side MCP client
  types.ts              # TypeScript type definitions
  transport/
    http.ts             # HTTP + SSE transport
    stdio.ts            # Development stdio transport
  tools/
    registry.ts         # Tool registration and lookup
    file-system.ts      # File read/write/list/search
    context7.ts         # Documentation lookup tools
    code-analysis.ts    # Lint/typecheck tools
    shell.ts            # Sandboxed shell execution
  resources/
    provider.ts         # Resource URI handlers
    project-context.ts  # Project context resource
  middleware/
    auth.ts             # API key validation
    error-handler.ts    # Error formatting
    logging.ts          # Request/response logging
```

## Integration with Agents

MCP tools are wrapped as OpenAI Agents SDK `Tool` objects:

```typescript
const context7Tool = new Tool({
  name: 'context7_lookup',
  description: 'Query Context7 for current library documentation',
  parameters: { libraryName: z.string(), query: z.string() },
  execute: async ({ libraryName, query }) => {
    return await mcpClient.callTool('query_docs', { libraryId: libraryName, query });
  }
});
```

## Scaling

| Aspect | Strategy |
|--------|----------|
| Concurrency | Async I/O, multiple simultaneous tool calls |
| Caching | Context7 responses cached with 5-min TTL |
| File operations | In-memory read cache per session |
| Shell commands | 1 concurrent execution limit |
| Memory | 512MB max heap |
