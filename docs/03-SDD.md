# Software Design Document — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | SDD-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Introduction

### 1.1 Purpose
This Software Design Document (SDD) describes the detailed design of the AI Software Company platform. It covers the decomposition of the system into components, their responsibilities, interfaces, and critical design decisions.

### 1.2 Scope
This document covers the architectural design, component decomposition, interface definitions, and design rationale for all subsystems.

### 1.3 Design Goals
| Goal | Priority | Rationale |
|------|----------|-----------|
| Separation of Concerns | Critical | Multi-agent system requires clear boundaries |
| Loose Coupling | Critical | Agents, tools, and UI must evolve independently |
| Testability | High | AI-generated output must be verifiable |
| Observability | High | Agent reasoning must be transparent to users |
| Extensibility | Medium | New agent types will be added |
| Performance | Medium | Pipeline must complete within minutes |

---

## 2. Design Overview

### 2.1 Architectural Style
The system follows a **hybrid architecture** combining:
- **Hexagonal Architecture** (Ports & Adapters) — for the backend core
- **Event-Driven Architecture** — for agent orchestration and state propagation
- **Pipeline Architecture** — for the sequential/parallel agent execution flow
- **Microkernel** — for the MCP tool plugin system

### 2.2 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Landing │ │ Dashboard│ │ Project  │ │ Agent Monitor │  │
│  │  Page   │ │          │ │   View   │ │  (Streaming)  │  │
│  └─────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / WSS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                        │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────────────┐  │
│  │ Auth     │ │ Project API  │ │ Agent Orchestrator API │  │
│  │ Module   │ │              │ │                        │  │
│  └──────────┘ └──────────────┘ └────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Agent Orchestrator Engine              │     │
│  │  ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────────┐ │     │
│  │  │ CEO  │ │  PM  │ │Architect │ │ Engineering  │ │     │
│  │  │Agent │ │Agent │ │  Agent   │ │   Agents     │ │     │
│  │  └──────┘ └──────┘ └──────────┘ └──────────────┘ │     │
│  │  ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────────┐ │     │
│  │  │ QA   │ │DevOps│ │ Document │ │ MCP Client   │ │     │
│  │  │Agent │ │Agent │ │  Agent   │ │              │ │     │
│  │  └──────┘ └──────┘ └──────────┘ └──────────────┘ │     │
│  └────────────────────────────────────────────────────┘     │
│                       │                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │              MCP Server (Context7)                  │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │     │
│  │  │ File Sys │ │ Context7 │ │ Code Analysis    │  │     │
│  │  │ Tools    │ │ Lookup   │ │ Tools            │  │     │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                  │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │  Neon PostgreSQL  │ │    Redis         │                  │
│  │  (Drizzle ORM)    │ │  (Cache/Queue)   │                  │
│  └──────────────────┘ └──────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Decomposition

### 3.1 Frontend Components

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| **LandingModule** | Public landing, marketing, sign-up | Next.js App Router |
| **AuthModule** | Login, register, OAuth flows | NextAuth.js / Custom JWT |
| **DashboardModule** | Project list, filters, search | Next.js Server Components |
| **ProjectModule** | Single project view, agent outputs | Client Components + Streaming |
| **AgentMonitor** | Real-time agent progress display | WebSocket + React hooks |
| **ApprovalGate** | Approve/reject agent output | React form + API client |
| **SettingsModule** | User profile, billing, team mgmt | Server/Client Components |
| **SharedUI** | Button, Card, Dialog, Toast, etc. | shadcn/ui + Radix UI |

### 3.2 Backend Components

| Component | Responsibility |
|-----------|----------------|
| **AuthController** | Registration, login, token refresh, OAuth |
| **UserController** | User profile CRUD |
| **ProjectController** | Project CRUD, status, approval actions |
| **AgentController** | Trigger agent, get agent status, provide feedback |
| **WebSocketGateway** | Real-time event broadcasting |
| **OrchestratorService** | Agent pipeline lifecycle management |
| **AgentService** | Individual agent execution logic |
| **FileGenerationService** | Writing generated code/docs to disk |
| **MCPService** | MCP client and tool invocation |
| **Context7Service** | Context7 API integration |
| **TokenService** | JWT creation, verification, rotation |
| **EmailService** | Transactional emails (welcome, notifications) |

### 3.3 Agent Components

| Agent | Prompt Strategy | Tools | Output |
|-------|----------------|-------|--------|
| **CEO** | System prompt + user description + Q&A | MCP file read | Project charter, scope |
| **PM** | System prompt + CEO output | MCP file read, Context7 | PRD document |
| **Architect** | System prompt + PRD | MCP file read, Context7 | SRS, SDD, architecture docs |
| **UI Designer** | System prompt + architecture docs | MCP file read, Context7 | Component spec, theme |
| **DB Engineer** | System prompt + architecture docs | MCP file read, Context7 | Drizzle schema, migrations |
| **Backend Engineer** | System prompt + architecture + DB | MCP file read/write, Context7 | Express.js code |
| **Frontend Engineer** | System prompt + architecture + UI | MCP file read/write, Context7 | Next.js code |
| **QA** | System prompt + all code output | MCP file read | Test files, test plan |
| **DevOps** | System prompt + all outputs | MCP file read/write | Docker, CI/CD, deploy config |
| **Documentation** | System prompt + all outputs | MCP file read/write | README, deployment guide |

### 3.4 MCP Components

| Component | Responsibility |
|-----------|----------------|
| **MCPServer** | MCP protocol implementation, tool registration, resource management |
| **FileSystemTool** | Read, write, search files in project directory |
| **Context7Tool** | Query Context7 for library documentation |
| **CodeAnalysisTool** | Lint, type-check, analyse generated code |
| **SchemaIntrospectionTool** | Read and analyse Drizzle schema files |
| **ShellTool** | Execute safe shell commands (npm, git, etc.) |

---

## 4. Data Design

### 4.1 Entity Relationship Summary

```
User ──1:N──> Project
User ──N:M──> Team (via Membership)
Project ──1:N──> AgentOutput
Project ──1:N──> ProjectFile
Project ──1:1──> Deployment
AgentOutput ──1:N──> Approval
AgentOutput ──1:N──> Feedback
```

### 4.2 Key Data Structures

#### Project
```
{
  id: string (UUID)
  userId: string (UUID)
  title: string
  description: text
  techStack: TechStack[]
  status: enum (draft, running, awaiting_approval, completed, failed)
  currentPhase: enum (ideation, planning, architecture, implementation, testing, deployment, delivery)
  metadata: JSONB
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### AgentOutput
```
{
  id: string (UUID)
  projectId: string (UUID)
  agentType: enum (ceo, pm, architect, ui_designer, db_engineer, backend_engineer, frontend_engineer, qa, devops, documentation)
  phase: enum
  content: JSONB (structured output)
  status: enum (pending, running, awaiting_approval, approved, rejected, completed, failed)
  iterationCount: number
  feedback: string?
  tokensUsed: number
  startedAt: timestamp
  completedAt: timestamp
}
```

---

## 5. Design Decisions

### Decision 1: Monorepo with npm Workspaces
| Attribute | Value |
|-----------|-------|
| **Context** | Need to share types, validation schemas, and utilities between frontend and backend |
| **Decision** | Use npm workspaces with root-level configuration |
| **Rationale** | Shared `@aisoftco/shared` package for Zod schemas, TypeScript types, constants |
| **Alternatives** | Turborepo, Nx, separate repos |
| **Consequence** | Simplified dependency management, but requires careful build pipeline |

### Decision 2: Agent Orchestration via BullMQ
| Attribute | Value |
|-----------|-------|
| **Context** | Agents can run for 1-10 minutes; need async execution with retries and queues |
| **Decision** | Use BullMQ with Redis for agent task queuing |
| **Rationale** | Reliable job processing, retries, delayed jobs, progress reporting |
| **Alternatives** | In-process execution, AWS SQS, RabbitMQ |
| **Consequence** | Redis dependency, but proven at scale |

### Decision 3: MCP over Direct API Calls
| Attribute | Value |
|-----------|-------|
| **Context** | Agents need access to tools (file system, web queries, code analysis) |
| **Decision** | Implement MCP server as the tool layer; agents communicate via MCP |
| **Rationale** | Standardised protocol, tool isolation, easy to add new tools |
| **Alternatives** | Direct function calls, custom tool registry |
| **Consequence** | Slight latency overhead, but significantly better architecture |

### Decision 4: WebSocket for Real-Time Streaming
| Attribute | Value |
|-----------|-------|
| **Context** | Agent execution can take minutes; users need to see progress |
| **Decision** | Use WebSocket (Socket.IO) for bidirectional real-time communication |
| **Rationale** | Persistent connection, low latency, supported by both Next.js and Express |
| **Alternatives** | SSE (unidirectional), polling (inefficient) |
| **Consequence** | Requires WebSocket server management |

### Decision 5: Drizzle ORM over Prisma
| Attribute | Value |
|-----------|-------|
| **Context** | Need type-safe database access with SQL-like control |
| **Decision** | Use Drizzle ORM |
| **Rationale** | Lighter weight, SQL-like API, better performance, great TypeScript inference |
| **Alternatives** | Prisma, TypeORM, Knex |
| **Consequence** | Slightly steeper learning curve, but better for complex queries |

### Decision 6: Zod for Shared Validation
| Attribute | Value |
|-----------|-------|
| **Context** | Validation needed on both frontend and backend; must stay in sync |
| **Decision** | Define Zod schemas in shared package; use on both frontend and backend |
| **Rationale** | Single source of truth for all validation logic |
| **Alternatives** | Joi, Yup, JSON Schema |
| **Consequence** | Excellent DX with TypeScript inference |

---

## 6. Interface Design

### 6.1 Internal Interfaces

| Interface | Source | Target | Protocol |
|-----------|--------|--------|----------|
| API Gateway | Frontend | Backend | HTTPS/REST |
| Agent Events | Backend | Frontend | WebSocket |
| Orchestrator Commands | API | Orchestrator | In-process |
| Tool Invocation | Agent | MCP Server | MCP JSON-RPC |
| File Operations | MCP Server | File System | OS Calls |
| Database Access | Services | PostgreSQL | Drizzle ORM |

### 6.2 External Interfaces

| Interface | Source | Target | Protocol |
|-----------|--------|--------|----------|
| LLM Inference | Agents | OpenAI API | HTTPS/REST |
| Documentation Lookup | MCP Server | Context7 | HTTPS/REST |
| Payment Processing | Backend | Stripe | HTTPS/REST |
| Deployment | DevOps Agent | Vercel API | HTTPS/REST |
| Source Control | Project | GitHub API | HTTPS/REST |

---

## 7. Error Handling Strategy

### 7.1 Error Classification
| Category | Examples | Response |
|----------|----------|----------|
| **Validation Error** | Invalid input, missing field | 400 + Zod error details |
| **Authentication Error** | Expired token, invalid credentials | 401 |
| **Authorization Error** | Insufficient permissions | 403 |
| **Not Found** | Resource doesn't exist | 404 |
| **Conflict** | Duplicate resource | 409 |
| **Rate Limited** | Too many requests | 429 + Retry-After header |
| **Agent Error** | LLM failure, tool failure | 500 + detailed agent error |
| **Internal Error** | Unexpected server error | 500 (no stack trace in production) |

### 7.2 Retry Strategy
| Operation | Max Retries | Backoff | Timeout |
|-----------|-------------|---------|---------|
| LLM API Call | 3 | Exponential (1s, 2s, 4s) | 60s |
| MCP Tool Call | 2 | Linear (1s, 2s) | 30s |
| File System Write | 1 | None | 5s |
| Database Query | 0 (fail fast) | N/A | 10s |

---

## 8. Logging & Observability

### 8.1 Log Levels
| Level | Purpose |
|-------|---------|
| ERROR | System failures, API errors, agent failures |
| WARN | Degraded performance, retries, rate limiting |
| INFO | State transitions, agent lifecycle, user actions |
| DEBUG | Tool calls, prompt inputs, intermediate state (dev only) |
| TRACE | Full token-by-token agent reasoning (dev only) |

### 8.2 Structured Log Format
```json
{
  "timestamp": "2026-07-13T12:00:00.000Z",
  "level": "INFO",
  "service": "orchestrator",
  "requestId": "req_abc123",
  "projectId": "proj_xyz789",
  "agentType": "architect",
  "message": "Agent output generated successfully",
  "metadata": {
    "tokensUsed": 4500,
    "duration": 12345
  }
}
```

---

## 9. Security Design

### 9.1 Authentication Flow
1. User submits credentials
2. Backend validates against Neon DB (bcrypt)
3. JWT access token (15 min) + refresh token (7 days) issued
4. Access token sent in `Authorization: Bearer <token>` header
5. Auth middleware validates on every protected request
6. Refresh token endpoint rotates tokens

### 9.2 Authorization Model
| Role | Permissions |
|------|-------------|
| **Owner** | Full access: create/edit/delete projects, manage team, billing |
| **Admin** | Create/edit projects, manage team members |
| **Member** | Create/edit own projects, view team projects |
| **Viewer** | View only |

### 9.3 API Security
- All endpoints rate-limited per user and per IP
- CORS configured to allow only frontend origin
- Helmet.js for security headers
- Input sanitisation and Zod validation on all inputs
- API keys for external services stored as environment variables

---

## 10. Testing Strategy

### 10.1 Test Levels
| Level | Tool | Target |
|-------|------|--------|
| Unit | Vitest | Services, utilities, validation |
| Integration | Vitest + Supertest | API endpoints, database operations |
| E2E | Playwright | Critical user flows |
| Agent | Custom test harness | Agent output quality validation |

### 10.2 Testing Principles
- **FIRST** principles: Fast, Isolated, Repeatable, Self-validating, Timely
- Mock external APIs (OpenAI, Context7) in unit tests
- Use test database (Neon branch) for integration tests
- Agent tests validate output structure, not exact content
