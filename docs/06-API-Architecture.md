# API Architecture — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | API-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. API Design Principles

- **RESTful** resource-oriented design
- **JSON** request and response bodies
- **Consistent error format** across all endpoints
- **Versioned** via URL prefix (`/api/v1/`)
- **Idempotent** where semantically appropriate
- **Stateless** authentication via JWT
- **Zod validation** on all inputs
- **Comprehensive error messages** with error codes

---

## 2. Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3001/api/v1` |
| Staging | `https://staging-api.aisoftco.com/api/v1` |
| Production | `https://api.aisoftco.com/api/v1` |

---

## 3. Standard Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | For protected routes | `Bearer <jwt_token>` |
| `X-Request-Id` | Recommended | UUID for request tracing |
| `X-Api-Version` | No | API version hint |

---

## 4. Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-07-13T12:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "invalid_string"
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-07-13T12:00:00.000Z"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-07-13T12:00:00.000Z",
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 5. Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 400 | `INVALID_REQUEST` | Malformed request body |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 401 | `TOKEN_EXPIRED` | Access token has expired |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (duplicate) |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 502 | `UPSTREAM_ERROR` | External service failure (OpenAI, Neon) |
| 503 | `SERVICE_UNAVAILABLE` | System under maintenance |

---

## 6. API Endpoints

### 6.1 Authentication

#### `POST /api/v1/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Alex Johnson"
}
```

**Validation Rules:**
- `email`: Valid email format, max 255 chars
- `password`: Min 8 chars, must contain uppercase, lowercase, number, special char
- `name`: Min 2, max 100 chars

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "Alex Johnson", "role": "member" },
    "tokens": {
      "accessToken": "jwt...",
      "refreshToken": "jwt...",
      "expiresIn": 900
    }
  }
}
```

#### `POST /api/v1/auth/login`
Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

#### `POST /api/v1/auth/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "jwt..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt...",
    "expiresIn": 900
  }
}
```

#### `POST /api/v1/auth/logout`
Invalidate current refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

---

### 6.2 User Profile

#### `GET /api/v1/users/me`
Get authenticated user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Alex Johnson",
    "avatarUrl": null,
    "role": "member",
    "createdAt": "2026-07-01T00:00:00.000Z"
  }
}
```

#### `PATCH /api/v1/users/me`
Update user profile.

**Request Body:**
```json
{
  "name": "Alex J.",
  "avatarUrl": "https://..."
}
```

---

### 6.3 Projects

#### `POST /api/v1/projects`
Create a new project and start the agent pipeline.

**Request Body:**
```json
{
  "title": "E-commerce Platform",
  "description": "A full-stack e-commerce platform with product management, cart, checkout, and payment integration...",
  "techStack": ["next.js", "express", "postgresql", "tailwind"],
  "teamId": "uuid | null"
}
```

**Validation Rules:**
- `title`: Min 3, max 255 chars
- `description`: Min 100, max 5000 chars
- `techStack`: Array of valid technology identifiers

**Response (201):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "title": "E-commerce Platform",
      "status": "draft",
      "currentPhase": "ideation",
      "createdAt": "2026-07-13T12:00:00.000Z"
    }
  }
}
```

#### `GET /api/v1/projects`
List user's projects.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | all | Filter by status |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `search` | string | - | Search in title/description |
| `sort` | string | `-createdAt` | Sort field (prefix - for DESC) |

#### `GET /api/v1/projects/:id`
Get project details with current agent output.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "title": "E-commerce Platform",
      "description": "...",
      "status": "awaiting_approval",
      "currentPhase": "architecture",
      "techStack": [...],
      "createdAt": "...",
      "updatedAt": "..."
    },
    "currentAgentOutput": {
      "id": "uuid",
      "agentType": "architect",
      "status": "awaiting_approval",
      "content": { ... },
      "createdAt": "..."
    },
    "allOutputs": [...],
    "files": [...]
  }
}
```

#### `DELETE /api/v1/projects/:id`
Soft-delete a project.

**Response (200):**
```json
{ "success": true, "data": { "message": "Project deleted" } }
```

---

### 6.4 Agent Pipeline

#### `POST /api/v1/projects/:id/approve`
Approve current agent's output and advance pipeline.

**Request Body:**
```json
{
  "comment": "Looks good, proceed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Approved. Starting next agent.",
    "nextAgent": "db_engineer",
    "projectStatus": "running"
  }
}
```

#### `POST /api/v1/projects/:id/reject`
Reject current agent's output with feedback.

**Request Body:**
```json
{
  "comment": "The database schema needs more indexes",
  "requestChanges": ["Add composite indexes on foreign keys"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Rejected. Agent will re-execute with feedback.",
    "iterationCount": 2,
    "maxIterations": 3
  }
}
```

#### `POST /api/v1/projects/:id/trigger-agent`
Manually trigger a pipeline phase (for recovery).

**Request Body:**
```json
{
  "agentType": "architect",
  "force": false
}
```

---

### 6.5 WebSocket

#### `WS /ws/project/:id`
Establish WebSocket connection for real-time project updates.

**Authentication:** Token passed as query parameter: `ws://host/ws/project/:id?token=jwt...`

**Events (Server → Client):**
```json
// Agent execution started
{ "event": "agent:started", "data": { "agentType": "architect", "startedAt": "..." } }

// Agent thinking/processing update
{ "event": "agent:thinking", "data": { "agentType": "architect", "message": "Analysing system requirements..." } }

// Tool usage
{ "event": "agent:tool_use", "data": { "agentType": "architect", "tool": "context7_lookup", "input": "...", "output": "..." } }

// Agent output generated
{ "event": "agent:output", "data": { "agentType": "architect", "outputSummary": "..." } }

// Agent complete (awaiting approval)
{ "event": "agent:awaiting_approval", "data": { "agentType": "architect", "outputId": "..." } }

// Agent error
{ "event": "agent:error", "data": { "agentType": "architect", "error": "..." } }

// Project completed
{ "event": "project:completed", "data": { "projectId": "..." } }

// Project failed
{ "event": "project:failed", "data": { "projectId": "...", "error": "..." } }
```

**Events (Client → Server):**
```json
// Ping to keep connection alive
{ "event": "ping" }

// Cancel current agent execution
{ "event": "agent:cancel", "data": { "agentType": "architect" } }
```

---

### 6.6 Agent Outputs

#### `GET /api/v1/projects/:id/outputs`
List all agent outputs for a project.

**Query Parameters:** `agentType` (optional filter)

#### `GET /api/v1/projects/:id/outputs/:outputId`
Get specific agent output with full content.

---

### 6.7 Project Files

#### `GET /api/v1/projects/:id/files`
List all generated files.

**Query Parameters:** `fileType` (optional filter)

#### `GET /api/v1/projects/:id/files/:fileId`
Get file content.

---

### 6.8 Deployments

#### `POST /api/v1/projects/:id/deploy`
Trigger deployment of generated project.

**Request Body:**
```json
{
  "platform": "vercel",
  "envVars": { "DATABASE_URL": "...", "NEXT_PUBLIC_API_URL": "..." }
}
```

#### `GET /api/v1/projects/:id/deployments`
List deployment history.

---

### 6.9 Teams

#### `POST /api/v1/teams`
Create a team.

**Request Body:**
```json
{
  "name": "My Team",
  "slug": "my-team"
}
```

#### `GET /api/v1/teams`
List user's teams.

#### `POST /api/v1/teams/:id/members`
Add member to team.

**Request Body:**
```json
{
  "email": "member@example.com",
  "role": "member"
}
```

---

### 6.10 Billing (Phase 2)

#### `GET /api/v1/billing/plan`
Get current subscription plan.

#### `POST /api/v1/billing/create-checkout`
Create Stripe checkout session.

#### `POST /api/v1/billing/webhook`
Stripe webhook handler.

---

## 7. API Security

### 7.1 Authentication
- JWT-based with access + refresh token pattern
- Access token: 15 minutes expiry, signed with RS256
- Refresh token: 7 days expiry, stored in DB as hash
- Token rotation on refresh (old refresh token invalidated)

### 7.2 Rate Limiting
| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Auth (login, register) | 10 requests | 15 minutes |
| Projects (CRUD) | 100 requests | 1 minute |
| Agent actions (approve/reject) | 30 requests | 1 minute |
| WebSocket connections | 10 per project | - |
| File downloads | 50 requests | 1 minute |

### 7.3 CORS
```
Allowed Origins: https://app.aisoftco.com, https://staging.aisoftco.com, http://localhost:3000
Allowed Methods: GET, POST, PATCH, DELETE
Allowed Headers: Content-Type, Authorization, X-Request-Id
```

---

## 8. Zod Validation Schemas

All API inputs are validated using Zod schemas, shared between frontend and backend via the `@aisoftco/shared` package.

```typescript
// shared/src/schemas/project.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(100).max(5000),
  techStack: z.array(z.string()).min(1).max(10),
  teamId: z.string().uuid().nullable().optional()
});

export const approveOutputSchema = z.object({
  comment: z.string().max(2000).optional()
});

export const rejectOutputSchema = z.object({
  comment: z.string().min(1).max(2000),
  requestChanges: z.array(z.string().max(500)).max(10).optional()
});
```

---

## 9. API Versioning Strategy

- URL-based versioning: `/api/v1/`, `/api/v2/` (future)
- Minor changes are backward-compatible within a major version
- Breaking changes trigger a new major version
- Deprecated versions supported for 6 months after replacement announcement

---

## 10. Client SDK

A generated TypeScript API client will be created in `shared/src/api-client/`:

```typescript
// Usage example
import { createApiClient } from '@aisoftco/shared';

const api = createApiClient({ baseUrl: 'https://api.aisoftco.com/api/v1' });

const { data: project } = await api.projects.create({
  title: 'My App',
  description: '...',
  techStack: ['next.js', 'express']
});
```

---

## 11. WebSocket Architecture

```
┌─────────┐     WSS      ┌───────────┐         ┌──────────┐
│ Browser │──────────────►│ Express   │─────────►│ Redis    │
│ (Socket │◄──────────────│ Server    │◄─────────│ Pub/Sub  │
│  .IO)   │     Events    │ (Socket   │  Events  │          │
└─────────┘               │  .IO)     │          └──────────┘
                          └───────────┘
                               │
                               │ Subscribe to project events
                               ▼
                          ┌──────────┐
                          │ BullMQ   │
                          │ (Agent   │
                          │ Events)  │
                          └──────────┘
```
