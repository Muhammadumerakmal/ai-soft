# System Architecture

## Architecture Style

**Layered Hexagonal Architecture** combined with an **Event-Driven Pipeline** for AI agent orchestration.

- **Separation of concerns** through strict layer boundaries
- **Domain isolation** via ports and adapters
- **Async resilience** through event-driven agent execution (BullMQ)
- **Extensibility** by allowing any layer to be replaced independently

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│  Next.js 16 · React Server/Client Components                │
│  Tailwind CSS · shadcn/ui · Radix UI                        │
│  TanStack Query · Socket.IO Client                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / WSS
┌─────────────────────────▼───────────────────────────────────┐
│                   API Gateway Layer                          │
│  Helmet → CORS → Rate Limit → Auth → Validation → Logger   │
└─────────────────────────┬───────────────────────────────────┘
┌─────────────────────────▼───────────────────────────────────┐
│                   Application Layer                          │
│  Controllers: Auth, Project, Agent, Team, Deploy, Billing   │
│  Services: Business logic, orchestration, coordination       │
└─────────────────────────┬───────────────────────────────────┘
┌─────────────────────────▼───────────────────────────────────┐
│                   Orchestration Layer                        │
│  BullMQ Queue · Agent Executor · Pipeline Engine             │
│  MCP Client · Approval Gates · Feedback Loops               │
└─────────────────────────┬───────────────────────────────────┘
┌─────────────────────────▼───────────────────────────────────┐
│                   Domain Layer                               │
│  10 AI Agents (CEO → Documentation)                         │
│  OpenAI Agents SDK · System Prompts · Tool Registry         │
└─────────────────────────┬───────────────────────────────────┘
┌─────────────────────────▼───────────────────────────────────┐
│                   Persistence Layer                          │
│  Neon PostgreSQL · Drizzle ORM · Redis · File System        │
└─────────────────────────┬───────────────────────────────────┘
┌─────────────────────────▼───────────────────────────────────┐
│                   External Layer                             │
│  OpenAI API · Context7 API · Stripe · Vercel · GitHub       │
└─────────────────────────────────────────────────────────────┘
```

## Request Lifecycle

```
Client → Middleware Stack → Controller → Service → Database/External
                                                              │
Client ← Middleware Stack ← Controller ← Service ←───────────┘
```

**Middleware pipeline order:**
1. `helmet()` — Security headers
2. `cors()` — Cross-origin configuration
3. `express.json()` — Body parser (1mb limit)
4. `requestId()` — Correlation ID generation
5. `logger()` — Pino HTTP logger
6. `rateLimit()` — express-rate-limit
7. `auth()` — JWT verification
8. `validate()` — Zod schema validation

## Component Decomposition

### Frontend Components
| Component | Responsibility | Location |
|-----------|----------------|----------|
| LandingModule | Public landing, marketing | Server Component |
| AuthModule | Login, register, OAuth | Client Component |
| DashboardModule | Project list, filters | Server + Client |
| ProjectModule | Project detail, agent outputs | Server + Client |
| AgentMonitor | Real-time agent progress | Client Component |
| ApprovalGate | Approve/reject agent output | Client Component |
| SettingsModule | Profile, billing, team | Server + Client |
| SharedUI | Button, Card, Dialog, Toast | shadcn/ui |

### Backend Components
| Component | Responsibility |
|-----------|----------------|
| AuthController | Registration, login, token refresh |
| ProjectController | Project CRUD, status, approval |
| AgentController | Trigger agent, get status, feedback |
| WebSocketGateway | Real-time event broadcasting |
| OrchestratorService | Agent pipeline lifecycle management |
| AgentService | Individual agent execution logic |
| FileGenerationService | Writing generated code/docs to disk |
| MCPService | MCP client and tool invocation |
| TokenService | JWT creation, verification, rotation |

### Agent Components
| Agent | Prompt Strategy | Tools | Output |
|-------|----------------|-------|--------|
| CEO | System + user description + Q&A | Context7 | Project charter |
| PM | System + CEO output | Context7 | PRD document |
| Architect | System + PRD | Context7 | SRS, SDD, architecture docs |
| UI Designer | System + architecture | Context7 | Component spec, theme |
| DB Engineer | System + architecture | Context7 | Drizzle schema, migrations |
| Backend Engineer | System + architecture + DB | Context7, File, Shell | Express.js code |
| Frontend Engineer | System + architecture + UI | Context7, File, Shell | Next.js code |
| QA | System + all code | File, Code Analysis | Test files, test plan |
| DevOps | System + all outputs | File, Shell | Docker, CI/CD, deploy |
| Documentation | System + all outputs | File | README, deployment guide |

## Architecture Decision Records

| ADR | Decision | Context |
|-----|----------|---------|
| ADR-001 | npm workspaces over Turborepo | Simpler setup, sufficient for 3 workspaces |
| ADR-002 | Drizzle over Prisma | SQL-like API, lighter weight, better perf |
| ADR-003 | BullMQ over in-process queues | Reliability, retries, observability |
| ADR-004 | MCP over direct tool calls | Standardisation, isolation, extensibility |
| ADR-005 | Zod over Joi/Yup | TypeScript inference, shared with frontend |
| ADR-006 | Socket.IO over raw WebSocket | Fallback, rooms, auto-reconnect |
| ADR-007 | Pino over Winston | Performance, structured JSON native |
| ADR-008 | RS256 JWT over HS256 | Asymmetric keys, no shared secret |
| ADR-009 | Neon over Supabase | Serverless PG, branching, pgBouncer built-in |
| ADR-010 | Vercel over AWS | Next.js-native deployment, edge functions |
| ADR-011 | Service layer auth over middleware auth | Closer to data, explicit, testable |
| ADR-012 | Direct Drizzle in services over repository pattern | Simplicity, Drizzle IS the repository |

## Design Decisions

**Monorepo with npm Workspaces:** Shared `@aisoftco/shared` package for Zod schemas, TypeScript types, constants. Simplified dependency management.

**Agent Orchestration via BullMQ:** Reliable job processing with retries, delayed jobs, and progress reporting. Redis-backed.

**MCP over Direct API Calls:** Standardised protocol for tool access. Tool isolation. Easy to add new tools. Slight latency overhead but significantly better architecture.

**WebSocket for Real-Time Streaming:** Persistent connection, low latency, bidirectional. Socket.IO with Redis adapter for multi-instance scaling.

**Drizzle ORM over Prisma:** Lighter weight, SQL-like API, better performance, excellent TypeScript inference.

**Zod for Shared Validation:** Single source of truth for all validation logic. Excellent DX with TypeScript inference.

## Security Architecture

**Defence-in-depth across five layers:**
1. **Network:** TLS 1.3, Vercel WAF, CORS
2. **Application:** Helmet.js, rate limiting, Zod validation, JWT + bcrypt
3. **Data:** Drizzle parameterised queries, Neon AES-256 at rest, TLS 1.3 in transit
4. **AI:** Prompt injection sanitisation, output schema validation, token budget enforcement
5. **Operations:** Audit logging (project_events), secrets via env vars, npm audit in CI

## Scalability Strategy

| Component | Scaling Strategy | Limit |
|-----------|-----------------|-------|
| Frontend | Vercel Edge automatic | Unlimited |
| API | Serverless function instances | 1000 concurrent |
| WebSocket | Redis adapter + multiple instances | Per-instance limit |
| BullMQ | Worker process count | Queue processing rate |
| Database | Neon auto-scaling compute | 4 vCPU per branch |
| Redis | Upstash storage + bandwidth | Pricing tier |
| MCP Server | Container instances | 10 concurrent |

## Deployment Architecture

- **Frontend:** Vercel (Next.js SSR on Edge)
- **API:** Vercel Serverless Functions (Express.js)
- **WebSocket:** Node.js server with Socket.IO
- **MCP Server:** Container (Docker, separate process)
- **Database:** Neon PostgreSQL (serverless)
- **Cache/Queue:** Upstash Redis
- **Monitoring:** Sentry (errors), Logtail (logs), Vercel Analytics (frontend)

**CI/CD:** GitHub Actions → lint → typecheck → test → build → Vercel deploy (automatic on main).

## Quality Attributes

| Attribute | Target | How Achieved |
|-----------|--------|-------------|
| Availability | 99.9% | Vercel multi-region, Neon HA, stateless backend |
| Scalability | 1000 concurrent | Horizontal scaling, auto-scaling DB, Redis caching |
| Performance | API p95 < 200ms | Connection pooling, caching, query optimisation |
| Security | Zero critical vulns | Defence-in-depth, SAST in CI, input validation everywhere |
| Maintainability | < 1hr to onboard | Strict layer separation, coding standards, docs |
| Testability | > 80% coverage | DI throughout, mocked externals, test DB per run |
| Observability | Full request tracing | Correlation IDs, structured logging, Sentry |
| Extensibility | New agent in < 1 day | Agent interface, MCP tools, pipeline config |
