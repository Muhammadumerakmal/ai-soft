# API Architecture

## Design Principles

- RESTful resource-oriented design
- JSON request and response bodies
- Consistent error format across all endpoints
- Versioned via URL prefix (`/api/v1/`)
- Stateless authentication via JWT
- Zod validation on all inputs
- Idempotency keys for safe mutation retries

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3001/api/v1` |
| Production | `https://api.aisoftco.com/api/v1` |

## Standard Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Protected routes | `Bearer <jwt>` |
| `X-Request-Id` | Recommended | UUID for tracing |
| `Idempotency-Key` | Mutations | Prevent duplicate processing |

## Response Envelope

### Success (single)
```json
{ "success": true, "data": { ... }, "meta": { "requestId": "...", "timestamp": "..." } }
```

### Success (list)
```json
{ "success": true, "data": [ ... ], "meta": { "requestId": "...", "page": 1, "limit": 20, "total": 150 } }
```

### Error
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] }, "meta": { ... } }
```

## Endpoint Catalogue

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Invalidate refresh token |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Get profile |
| PATCH | `/users/me` | Update profile |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List user's projects |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project detail |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Soft-delete project |

### Agent Pipeline
| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/:id/approve` | Approve current agent output |
| POST | `/projects/:id/reject` | Reject with feedback |
| POST | `/projects/:id/trigger-agent` | Manually trigger agent |

### Outputs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects/:id/outputs` | List agent outputs |
| GET | `/projects/:id/outputs/:outputId` | Get specific output |

### Files
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects/:id/files` | List generated files |
| GET | `/projects/:id/files/:fileId` | Get file content |

### Teams
| Method | Path | Description |
|--------|------|-------------|
| POST | `/teams` | Create team |
| GET | `/teams` | List teams |
| GET | `/teams/:id` | Get team detail |
| POST | `/teams/:id/members` | Invite member |

### Deployments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/:id/deploy` | Start deployment |
| GET | `/projects/:id/deployments` | List deployments |

### Billing
| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/plan` | Get current plan |
| POST | `/billing/create-checkout` | Stripe checkout |
| POST | `/billing/webhook` | Stripe webhook |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |

## Error Codes

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Zod validation failed |
| 401 | `UNAUTHORIZED` | Missing/invalid token |
| 401 | `TOKEN_EXPIRED` | Access token expired |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate resource |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 502 | `UPSTREAM_ERROR` | External service failure |
| 503 | `SERVICE_UNAVAILABLE` | Maintenance |

## Rate Limiting

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Auth (login, register) | 10 requests | 15 min |
| Projects (CRUD) | 100 requests | 1 min |
| Agent actions | 30 requests | 1 min |
| WebSocket connections | 10 per project | — |
| File downloads | 50 requests | 1 min |

## WebSocket Events

**Server → Client:**
- `agent:started` — Agent execution began
- `agent:thinking` — Agent processing update
- `agent:tool_use` — Tool call with input/output
- `agent:output` — Partial output available
- `agent:awaiting_approval` — Output ready for review
- `agent:error` — Agent execution failed
- `project:completed` — Full pipeline done
- `project:failed` — Pipeline failed

**Client → Server:**
- `ping` — Keep-alive
- `agent:cancel` — Cancel current agent

## API Security

- JWT access (15min) + refresh (7d) token pattern
- RS256 signing with 2048-bit key
- Refresh token rotation (old invalidated on refresh)
- CORS restricted to known origins
- Rate limiting per user and per IP
- All inputs validated via Zod before processing
