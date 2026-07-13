# MCP Architecture — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | MCP-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Overview

The Model Context Protocol (MCP) server is a critical infrastructure component that provides AI agents with structured access to tools, resources, and real-time context. It follows the official MCP specification (JSON-RPC-based) and serves as the bridge between AI agents and the external world.

---

## 2. MCP Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                  AI Agent (OpenAI Agents SDK)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Agent    │  │ Runner   │  │ Tool Registry        │  │
│  │ Instance │──│ (SDK)    │──│ (MCP Client Adapter) │  │
│  └──────────┘  └──────────┘  └──────────┬───────────┘  │
└──────────────────────────────────────────┼──────────────┘
                                           │
                                    MCP Protocol
                                  (JSON-RPC over HTTP)
                                           │
┌──────────────────────────────────────────┼──────────────┐
│                  MCP Server              │              │
│  ┌───────────────────────────────────────▼───────────┐  │
│  │              MCP Core Engine                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │ Tool       │  │ Resource   │  │ Prompt     │  │  │
│  │  │ Registry   │  │ Provider   │  │ Template   │  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                 │
│  ┌──────────────────────┼─────────────────────────────┐  │
│  │                      │                             │  │
│  │  ┌───────────────────▼────────────────────┐        │  │
│  │  │          Tool Implementations           │        │  │
│  │  │                                         │        │  │
│  │  │  ┌──────────────────────────────────┐  │        │  │
│  │  │  │  File System Tools               │  │        │  │
│  │  │  │  - read_file(path)               │  │        │  │
│  │  │  │  - write_file(path, content)     │  │        │  │
│  │  │  │  - list_directory(path)          │  │        │  │
│  │  │  │  - search_code(pattern)          │  │        │  │
│  │  │  │  - delete_file(path)             │  │        │  │
│  │  │  └──────────────────────────────────┘  │        │  │
│  │  │                                         │        │  │
│  │  │  ┌──────────────────────────────────┐  │        │  │
│  │  │  │  Context7 Lookup Tools            │  │        │  │
│  │  │  │  - resolve_library_id(name, q)   │  │        │  │
│  │  │  │  - query_docs(lib_id, query)     │  │        │  │
│  │  │  └──────────────────────────────────┘  │        │  │
│  │  │                                         │        │  │
│  │  │  ┌──────────────────────────────────┐  │        │  │
│  │  │  │  Code Analysis Tools              │  │        │  │
│  │  │  │  - lint_code(path)               │  │        │  │
│  │  │  │  - type_check(path)              │  │        │  │
│  │  │  │  - analyse_complexity(path)      │  │        │  │
│  │  │  └──────────────────────────────────┘  │        │  │
│  │  │                                         │        │  │
│  │  │  ┌──────────────────────────────────┐  │        │  │
│  │  │  │  Shell Execution Tools            │  │        │  │
│  │  │  │  - execute_command(cmd, args)    │  │        │  │
│  │  │  │  - npm_install(path)             │  │        │  │
│  │  │  │  - run_tests(path, framework)    │  │        │  │
│  │  │  └──────────────────────────────────┘  │        │  │
│  │  │                                         │        │  │
│  │  │  ┌──────────────────────────────────┐  │        │  │
│  │  │  │  Database Introspection Tools     │  │        │  │
│  │  │  │  - read_schema(path)             │  │        │  │
│  │  │  │  - analyse_indexes(path)         │  │        │  │
│  │  │  │  - validate_migrations(path)     │  │        │  │
│  │  │  └──────────────────────────────────┘  │        │  │
│  │  └─────────────────────────────────────────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. MCP Protocol Implementation

### 3.1 Transport Layer
- **Primary Transport**: HTTP with SSE (Server-Sent Events) for streaming responses
- **Secondary Transport**: stdio for local development
- **Port**: 3002 (configurable)

### 3.2 Protocol Version
- MCP Specification: 2025-03-26
- JSON-RPC 2.0 for all messages

### 3.3 Connection Lifecycle
1. Client sends `initialize` request with capabilities
2. Server responds with supported protocol version and capabilities
3. Client sends `initialized` notification
4. Normal operation (tool calls, resource access)
5. Connection termination

---

## 4. Tools Specification

### 4.1 File System Tools

#### `read_file`
```json
{
  "name": "read_file",
  "description": "Read the contents of a file in the project directory",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Relative path from project root" },
      "offset": { "type": "integer", "description": "Line offset (optional)" },
      "limit": { "type": "integer", "description": "Max lines to read (optional)" }
    },
    "required": ["path"]
  }
}
```

#### `write_file`
```json
{
  "name": "write_file",
  "description": "Write content to a file in the project directory. Creates directories if needed.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Relative path from project root" },
      "content": { "type": "string", "description": "File content" },
      "overwrite": { "type": "boolean", "description": "Overwrite if exists (default: false)" }
    },
    "required": ["path", "content"]
  }
}
```

#### `list_directory`
```json
{
  "name": "list_directory",
  "description": "List files and directories in a path",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Relative path" },
      "pattern": { "type": "string", "description": "Glob filter (optional)" }
    },
    "required": ["path"]
  }
}
```

#### `search_code`
```json
{
  "name": "search_code",
  "description": "Search for patterns in project files using regex",
  "inputSchema": {
    "type": "object",
    "properties": {
      "pattern": { "type": "string", "description": "Regex pattern" },
      "include": { "type": "string", "description": "File glob filter" },
      "path": { "type": "string", "description": "Directory to search (optional)" }
    },
    "required": ["pattern"]
  }
}
```

### 4.2 Context7 Lookup Tools

#### `resolve_library_id`
```json
{
  "name": "resolve_library_id",
  "description": "Resolve a library name to a Context7 library ID for documentation queries",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "The user's question or task" },
      "libraryName": { "type": "string", "description": "Library name to resolve" }
    },
    "required": ["query", "libraryName"]
  }
}
```

#### `query_docs`
```json
{
  "name": "query_docs",
  "description": "Query Context7 for up-to-date library documentation and code examples",
  "inputSchema": {
    "type": "object",
    "properties": {
      "libraryId": { "type": "string", "description": "Context7 library ID (format: /org/project)" },
      "query": { "type": "string", "description": "Specific question or concept" }
    },
    "required": ["libraryId", "query"]
  }
}
```

### 4.3 Code Analysis Tools

#### `lint_code`
```json
{
  "name": "lint_code",
  "description": "Run ESLint on specified files and return results",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "File or directory path" },
      "fix": { "type": "boolean", "description": "Auto-fix issues (default: false)" }
    },
    "required": ["path"]
  }
}
```

#### `type_check`
```json
{
  "name": "type_check",
  "description": "Run TypeScript compiler check and return errors",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Directory with tsconfig.json" }
    },
    "required": ["path"]
  }
}
```

### 4.4 Shell Execution Tools

#### `execute_command`
```json
{
  "name": "execute_command",
  "description": "Execute a shell command in the project directory. Allowed commands: npm, npx, node, git, ls, cat.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "command": { "type": "string", "description": "Command name" },
      "args": { "type": "array", "items": { "type": "string" }, "description": "Command arguments" },
      "timeout": { "type": "integer", "description": "Timeout in ms (default: 30000)" }
    },
    "required": ["command", "args"]
  }
}
```

### 4.5 Database Introspection Tools

#### `read_schema`
```json
{
  "name": "read_schema",
  "description": "Parse and return Drizzle schema definitions from the project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Path to schema directory" }
    },
    "required": ["path"]
  }
}
```

---

## 5. Resources

MCP resources provide read-only data to agents without requiring tool calls.

### 5.1 Project Context Resource
```
URI Template: mcp://project/{projectId}/context
Description: Current project state, including all agent outputs and status
```

### 5.2 Project Files Resource
```
URI Template: mcp://project/{projectId}/files/{filePath}
Description: Read a specific generated file
```

### 5.3 Agent Output Resource
```
URI Template: mcp://project/{projectId}/outputs/{agentType}
Description: Latest output from a specific agent type
```

---

## 6. Prompt Templates

MCP prompt templates provide structured prompting patterns for agents.

### 6.1 Code Generation Template
```
URI: mcp://prompts/generate-code
Arguments: { component, style, framework, patterns }
Template: A structured prompt for generating production-grade code following project conventions.
```

### 6.2 Documentation Template
```
URI: mcp://prompts/generate-docs
Arguments: { projectName, audience, format }
Template: A structured prompt for generating technical documentation.
```

---

## 7. Security

### 7.1 Tool Access Control
| Tool Category | Allowed Agents | Restrictions |
|---------------|----------------|--------------|
| File System (read) | All agents | Scoped to project directory |
| File System (write) | Engineering agents, QA, DevOps, Docs | Project directory only |
| Context7 Lookup | All agents | No restrictions |
| Code Analysis | QA, Architect, Documentation | Project directory |
| Shell Execution | DevOps, Backend Engineer, Frontend Engineer | Whitelisted commands only |
| Database Introspection | DB Engineer, Architect | Schema directory only |

### 7.2 Sandboxing
- File system operations restricted to project directory using path traversal prevention
- Shell commands restricted to an allowlist: `npm`, `npx`, `node`, `git`, `ls`, `cat`
- Command injection prevention via parameterised execution
- Timeout enforced on all shell commands (default 30s)

### 7.3 Authentication
- MCP Server validates a shared API key from environment variable `MCP_API_KEY`
- All requests must include `Authorization: Bearer <key>`
- Internal calls from the orchestrator use a short-lived signed token

---

## 8. MCP Server Implementation

### 8.1 Technology Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Custom MCP server implementation (or MCP SDK)
- **Transport**: Express.js for HTTP/SSE
- **Validation**: Zod for tool input validation

### 8.2 Directory Structure
```
backend/
  src/
    mcp/
      index.ts               # MCP server entry point
      server.ts              # MCP core server (protocol handling)
      transport/
        http.ts              # HTTP + SSE transport
        stdio.ts             # stdio transport (development)
      tools/
        registry.ts          # Tool registration and lookup
        file-system.ts       # File read/write/search tools
        context7.ts          # Context7 documentation tools
        code-analysis.ts     # Lint, type-check tools
        shell.ts             # Shell execution tools
        db-introspect.ts     # Drizzle schema introspection
      resources/
        provider.ts          # Resource URI handlers
        project-context.ts   # Project context resource
      prompts/
        registry.ts          # Prompt template registry
      middleware/
        auth.ts              # API key validation
        error-handler.ts     # Error formatting
        logging.ts           # Request/response logging
      types.ts               # MCP type definitions
```

### 8.3 Core Server Implementation Pattern
```typescript
class MCPServer {
  private tools: Map<string, ToolHandler>;
  private resources: Map<string, ResourceHandler>;
  private prompts: Map<string, PromptTemplate>;

  async handleRequest(message: JSONRPCRequest): Promise<JSONRPCResponse> {
    switch (message.method) {
      case 'tools/call':
        return this.handleToolCall(message);
      case 'resources/read':
        return this.handleResourceRead(message);
      case 'prompts/get':
        return this.handlePromptGet(message);
      // ... other methods
    }
  }

  async handleToolCall(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    const tool = this.tools.get(request.params.name);
    if (!tool) return methodNotFound(request);
    const validatedParams = tool.schema.parse(request.params.arguments);
    const result = await tool.handler(validatedParams);
    return successResponse(request, result);
  }
}
```

---

## 9. Integration with Agent Pipeline

### 9.1 MCP Client in Agent Executor
```typescript
// backend/src/orchestrator/mcp-client.ts
class MCPClient {
  private serverUrl: string;
  private apiKey: string;

  async callTool(toolName: string, args: Record<string, unknown>) {
    const response = await fetch(`${this.serverUrl}/mcp/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: crypto.randomUUID(),
        method: 'tools/call',
        params: { name: toolName, arguments: args }
      })
    });
    return response.json();
  }
}
```

### 9.2 Tool Conversion for OpenAI Agents SDK
The MCP tools are wrapped as OpenAI Agents SDK `Tool` objects:

```typescript
function mcpToolToAgentSDK(mcpTool: MCPToolDef): Tool {
  return new Tool({
    name: mcpTool.name,
    description: mcpTool.description,
    parameters: convertJsonSchemaToZod(mcpTool.inputSchema),
    execute: async (args) => {
      return mcpClient.callTool(mcpTool.name, args);
    }
  });
}
```

---

## 10. Scaling & Performance

| Aspect | Strategy |
|--------|----------|
| Concurrency | MCP Server handles multiple concurrent tool calls via async I/O |
| Caching | Context7 responses cached with TTL (5 min) to reduce duplicate lookups |
| File Operations | File reads cached in memory per session |
| Shell Commands | Limited to 1 concurrent execution to prevent resource contention |
| Memory Limit | 512MB max heap for MCP server process |
