# System Architecture — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | SA-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Architecture Overview

The AI Software Company platform follows a **Layered Microservices Architecture** combined with an **Event-Driven Agent Pipeline**. The system is deployed as a monorepo with two primary runtime targets — a Next.js frontend and an Express.js backend — connected via REST API and WebSocket.

---

## 2. Architecture Diagram (Text)

```
                         ┌──────────────────┐
                         │   Vercel Edge    │
                         │  (CDN + Routing) │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │       Next.js 16 App        │
                    │  ┌──────────────────────┐  │
                    │  │   React Server        │  │
                    │  │   Components (RSC)    │  │
                    │  ├──────────────────────┤  │
                    │  │   React Client        │  │
                    │  │   Components          │  │
                    │  ├──────────────────────┤  │
                    │  │   API Client (fetch) │  │
                    │  ├──────────────────────┤  │
                    │  │   WebSocket Client   │  │
                    │  │   (Socket.IO)        │  │
                    │  └──────────────────────┘  │
                    └────────┬───────────────────┘
                             │ HTTPS / WSS
                             ▼
┌────────────────────────────────────────────────────────────┐
│                   Express.js Backend                        │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Middleware Stack                       │   │
│  │  Rate Limit → CORS → Auth → Validation → Logger   │   │
│  └────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Routes / Controllers                   │   │
│  │  /api/auth → AuthController                        │   │
│  │  /api/projects → ProjectController                 │   │
│  │  /api/agents → AgentController                     │   │
│  │  /api/users → UserController                       │   │
│  │  /api/deploy → DeployController                    │   │
│  └────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Service Layer                          │   │
│  │  AuthService, ProjectService, AgentService,        │   │
│  │  OrchestratorService, FileGenService,               │   │
│  │  MCPService, Context7Service, DeployService        │   │
│  └────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Agent Orchestrator Engine                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │   │
│  │  │ BullMQ   │  │ Agent    │  │ MCP Client     │  │   │
│  │  │ Queue    │──│ Executor │──│ (Tool Access)  │  │   │
│  │  └──────────┘  └──────────┘  └────────────────┘  │   │
│  │         │          │                               │   │
│  │  ┌──────┴──────────┴──────┐                       │   │
│  │  │   OpenAI API Client    │                       │   │
│  │  └────────────────────────┘                       │   │
│  └────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │              MCP Server                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │ File Sys │ │ Context7 │ │ Code Analysis    │   │   │
│  │  │ Tools    │ │ Lookup   │ │ Tools            │   │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Data Access                            │   │
│  │  ┌────────────────┐  ┌────────────────┐           │   │
│  │  │ Drizzle ORM    │  │ Redis Client   │           │   │
│  │  │ (Neon PG)      │  │ (Cache/Queue)  │           │   │
│  │  └────────────────┘  └────────────────┘           │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Layer Architecture

### 3.1 Presentation Layer (Frontend)
- **Next.js 16 App Router** for server-rendered pages
- **React Server Components (RSC)** for data fetching and initial render
- **React Client Components** for interactive UI
- **shadcn/ui + Radix UI** for accessible, composable components
- **Tailwind CSS** for styling (utility-first approach)
- **Socket.IO Client** for real-time WebSocket communication

### 3.2 API Gateway Layer
- Provided by Next.js API routes or Express.js, depending on deployment architecture
- Routes incoming requests to appropriate controllers
- Handles CORS, rate limiting, and initial authentication checks

### 3.3 Application Layer (Backend)
- **Express.js** with TypeScript
- **MVC + Service Layer** pattern
- **Controllers**: Handle HTTP request/response, delegate to services
- **Services**: Business logic, orchestrator coordination, file generation
- **Middleware**: Auth, validation, rate limiting, error handling, logging

### 3.4 Agent Orchestration Layer
- **BullMQ** job queue for reliable agent execution
- **Agent Executor**: Wraps OpenAI Agents SDK, manages agent lifecycle
- **Agent Prompts**: Role-specific system prompts with dynamic context injection
- **Approval Gate Logic**: Pauses pipeline between agents for human review
- **Feedback Loop**: Iterates agent execution with user feedback

### 3.5 Tool Layer (MCP Server)
- **MCP Protocol Server**: JSON-RPC-based tool invocation
- **File System Tools**: Read/write/delete files in generated project
- **Context7 Integration**: Real-time documentation lookup
- **Code Analysis Tools**: Static analysis and linting
- **Database Introspection**: Drizzle schema analysis

### 3.6 Data Layer
- **Neon PostgreSQL**: Primary database (serverless, auto-scaling)
- **Drizzle ORM**: Type-safe SQL query builder
- **Redis**: Session cache, BullMQ queue backend, rate limiter store
- **File System**: Generated project files stored on disk (or S3 in production)

---

## 4. Request Flow

### User Creates a Project
```
User → Next.js (Project Form)
     → POST /api/projects
     → Auth Middleware (JWT validation)
     → ProjectController.create()
     → ProjectService.createProject()
     → Drizzle INSERT → PostgreSQL
     → OrchestratorService.startPipeline()
     → BullMQ.add(CEO_AGENT_JOB)
     → Response: { projectId, status: "pending" }
     → WebSocket: project:created
```

### Agent Pipeline Execution
```
BullMQ Worker picks up CEO_AGENT_JOB
→ AgentExecutor.run(CEO, context)
   → OpenAI API call with CEO system prompt
   → MCP tools invoked as needed
   → Output stored in DB
   → WebSocket: agent:complete
→ Pipeline paused → AWAITING_APPROVAL
→ User approves via POST /api/projects/:id/approve
→ BullMQ.add(PM_AGENT_JOB)
→ ... continues through all agents
```

---

## 5. Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Vercel                             │
│  ┌──────────────────┐  ┌────────────────────────┐   │
│  │ Next.js Frontend │  │ Express.js Backend     │   │
│  │ (Vercel Edge)    │  │ (Serverless Functions) │   │
│  └──────────────────┘  └────────────────────────┘   │
│                            │                         │
│  ┌──────────────────────────────────────────────┐   │
│  │           MCP Server (Separate Service)      │   │
│  │           (Vercel or Dedicated Host)         │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────┴───────────────────────────────┐
│              External Services                        │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────┐    │
│  │ Neon (PG)    │ │ Redis    │ │ OpenAI API   │    │
│  │ Serverless   │ │ (Upstash)│ │              │    │
│  └──────────────┘ └──────────┘ └──────────────┘    │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────┐    │
│  │ Context7 API │ │ Stripe   │ │ GitHub API   │    │
│  └──────────────┘ └──────────┘ └──────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## 6. Scalability Strategy

### 6.1 Horizontal Scaling
- **Backend**: Stateless Express.js scales horizontally behind load balancer
- **Agent Processing**: BullMQ workers can scale independently
- **WebSocket**: Socket.IO adapter with Redis for multi-instance broadcasts
- **Database**: Neon auto-scaling with connection pooling (pgBouncer compatible)

### 6.2 Vertical Scaling
- **MCP Server**: Beefier instance for file system operations
- **Redis**: Scale memory for larger queues

### 6.3 Performance Optimizations
- **Response caching**: Redis cache for frequently accessed project metadata
- **Query optimisation**: Drizzle prepared statements, proper indexing
- **LLM optimisation**: Token budgeting, response caching for repeated queries
- **File operations**: Streaming file writes, async I/O

---

## 7. Security Architecture

### 7.1 Network Security
- All traffic over TLS 1.3
- Vercel WAF for DDoS protection
- CORS restricted to known origins

### 7.2 Application Security
- Helmet.js security headers
- Zod input validation on all API endpoints
- Parameterised queries via Drizzle (SQL injection protection)
- Rate limiting (express-rate-limit + Redis store)
- JWT with RS256 signing

### 7.3 Data Security
- Encryption at rest (Neon PostgreSQL AES-256)
- Encryption in transit (TLS 1.3)
- Secrets managed via environment variables (Vercel Environment Variables)
- No secrets in code, no secrets in generated output

### 7.4 AI Security
- Prompt injection mitigation via input sanitisation and system prompt hardening
- Output validation before display to users
- Token limits to prevent abuse
- Agent output scanning for sensitive data exposure

---

## 8. Observability

### 8.1 Logging
- Structured JSON logging via Pino
- Centralised log aggregation (Vercel Logs + custom solution)
- Request tracing with correlation IDs

### 8.2 Monitoring
- Vercel Analytics for frontend performance
- Sentry or similar for error tracking
- BullMQ dashboard for queue monitoring
- Neon monitoring for database performance

### 8.3 Alerting
- Agent execution failure alerts
- API error rate threshold alerts
- LLM API latency/cost anomalies
- Database connection pool exhaustion

---

## 9. Disaster Recovery

| Scenario | RTO | RPO | Recovery Strategy |
|----------|-----|-----|-------------------|
| Backend crash | < 5 min | N/A | Vercel auto-restart, multiple instances |
| Database failure | < 4 hr | < 1 hr | Neon automated backup restore |
| LLM API outage | < 1 min | N/A | Queue jobs for retry; graceful degradation |
| Full region failure | < 4 hr | < 1 hr | Multi-region configuration (future) |

---

## 10. Technology Stack Decision Matrix

| Technology | Selected | Alternatives | Rationale |
|------------|----------|--------------|-----------|
| Frontend Framework | Next.js 16 | Remix, SvelteKit | Best Vercel integration, RSC support |
| UI Library | shadcn/ui + Radix | MUI, Chakra, Ant | Accessible, composable, Tailwind-native |
| Styling | Tailwind CSS | CSS Modules, Styled Components | Utility-first, rapid development |
| Backend Framework | Express.js | Fastify, Hono | Ecosystem, middleware maturity |
| Database | Neon PostgreSQL | Supabase, PlanetScale | Serverless, Drizzle-compatible, branching |
| ORM | Drizzle | Prisma, TypeORM | Type-safe, SQL-like, lightweight |
| Validation | Zod | Joi, Yup | TypeScript inference, runtime validation |
| Queue | BullMQ + Redis | RabbitMQ, SQS | Node.js-native, simple, feature-rich |
| AI SDK | OpenAI Agents SDK | LangChain, Vercel AI SDK | Agent lifecycle, tool use, handoffs |
| Real-time | Socket.IO | WebSocket raw, SSE | Fallback support, rooms, auto-reconnect |
| Deployment | Vercel | AWS, Railway, Render | Next.js-native, edge functions, DX |
