# Phase 4 — MCP Integration

## Objective
Build the MCP (Model Context Protocol) server and integrate it with the agent pipeline, replacing direct tool calls with standardised MCP tool invocations for improved extensibility, security, and tool isolation.

## Scope
MCP server implementation, tool development, and agent integration. No changes to agent prompts, pipeline logic, or frontend.

## Internal Phases

| Internal Phase | Deliverable |
|----------------|-------------|
| 4.1 MCP Server Core | Protocol handler, JSON-RPC dispatch, HTTP/SSE transport, stdio transport |
| 4.2 Auth & Security | API key validation, path traversal protection, command injection prevention, per-tool ACL |
| 4.3 File System Tools | read_file, write_file, list_directory, search_code, delete_file |
| 4.4 Context7 Tools | resolve_library_id, query_docs (with response caching) |
| 4.5 Code Analysis Tools | lint_code, type_check, analyse_complexity |
| 4.6 Shell Tools | execute_command (with command allowlist and sandboxing) |
| 4.7 Resources | project context resource, file resource, agent output resource |
| 4.8 Agent Integration | MCP client wrapper, tool conversion (MCP → OpenAI SDK Tool), fallback handling |
| 4.9 Caching | Context7 response caching (5-min TTL), file read caching per session |

## Architecture Diagram

```
Agent (OpenAI Agents SDK)
  → MCP Client (in orchestrator)
    → HTTP/SSE Transport
      → MCP Server (port 3002)
        → Auth Middleware (API key)
        → Tool Registry
          → FileSystemTools (read/write/list/search)
          → Context7Tools (resolve/query)
          → CodeAnalysisTools (lint/typecheck)
          → ShellTools (execute)
        → Resource Provider
```

## Tool Specifications

| Tool | Input | Security Restriction |
|------|-------|---------------------|
| `read_file` | path, offset?, limit? | Path traversal check; max 10MB |
| `write_file` | path, content, overwrite? | Path traversal check; project dir only |
| `list_directory` | path, pattern? | Path traversal check |
| `search_code` | pattern, include?, path? | Path traversal check; regex timeout |
| `resolve_library_id` | query, libraryName | No restriction; cached 5 min |
| `query_docs` | libraryId, query | No restriction; cached 5 min |
| `lint_code` | path, fix? | Path traversal check; 30s timeout |
| `type_check` | path | Path traversal check; 60s timeout |
| `execute_command` | command, args[], timeout? | Allowlist only; 30s timeout |

## Tool Access Control by Agent

| Agent | File Read | File Write | Shell | Context7 | Code Analysis |
|-------|-----------|------------|-------|----------|---------------|
| CEO | — | — | — | ✓ | — |
| PM | — | — | — | ✓ | — |
| Architect | — | — | — | ✓ | — |
| UI Designer | — | — | — | ✓ | — |
| DB Engineer | — | — | — | ✓ | — |
| Backend Engineer | ✓ | ✓ | ✓ | ✓ | — |
| Frontend Engineer | ✓ | ✓ | ✓ | ✓ | — |
| QA | ✓ | — | ✓ | — | ✓ |
| DevOps | ✓ | ✓ | ✓ | — | — |
| Documentation | ✓ | ✓ | — | — | — |

## Dependencies
- Phase 3 complete (all agents working with direct tool calls)

## Acceptance Criteria
- [ ] MCP server starts and responds to `initialize` request
- [ ] All 12 tools registered and callable
- [ ] `read_file` returns file contents within project boundary
- [ ] Path traversal attempts (`../../etc/passwd`) are blocked
- [ ] `execute_command` rejects non-whitelisted commands
- [ ] Context7 tools return accurate documentation with caching
- [ ] Code analysis tools return valid lint/type results
- [ ] All agents successfully use MCP tools (output quality maintained)
- [ ] MCP server failure does not crash pipeline (graceful fallback)
- [ ] Caching reduces duplicate Context7 calls by > 50%

## Verification
```bash
# Start MCP server
cd backend && npm run mcp

# Test initialize
curl -X POST http://localhost:3002/mcp/v1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26"}}'

# Test tool call
curl -X POST http://localhost:3002/mcp/v1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_API_KEY" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_file","arguments":{"path":"backend/package.json"}}}'

# Run full pipeline — verify agents use MCP tools
# (check logs for MCP tool invocation entries)
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| MCP call overhead slows agents | Connection pooling, caching, tool call batching |
| JSON-RPC serialisation errors | Strict input validation, schema enforcement |
| Shell tool exploited | Allowlist only; no pipes, redirects, or subshells |
| Path traversal | Canonical path resolution, project root boundary check |
