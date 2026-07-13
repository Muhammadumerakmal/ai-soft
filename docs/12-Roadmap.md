# Engineering Roadmap — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | RM-002 |
| **Version** | 2.0 |
| **Status** | Approved |
| **Author** | Principal Software Architect |
| **Date** | 2026-07-13 |
| **Supersedes** | RM-001 (v1.0 Phase-based roadmap) |

---

## 1. Roadmap Philosophy

This roadmap is designed around **Specification-Driven Development** and **Incremental Delivery**.

### Principles
- **Single Responsibility per Phase**: Each phase owns exactly one concern.
- **Working Application Every Phase**: The application builds, starts, and passes all prior tests at the end of every phase.
- **Independent Testability**: Each phase adds tests that validate only its scope.
- **Strict Dependency Hierarchy**: Phase N depends on all phases 1..N-1. No skipping.
- **No Mixed Concerns**: Features from different domains never share a phase.
- **Builds on Previous Phases**: Each phase extends without rewriting.

### Phase Structure (Template)

Each phase follows this canonical structure:

| Section | Description |
|---------|-------------|
| **Objective** | One-sentence purpose of the phase |
| **Scope** | Boundaries — what is included and explicitly excluded |
| **Features** | Numbered list of specific features delivered |
| **Deliverables** | Concrete artifacts produced |
| **Files/Folders** | Every file created or modified |
| **Dependencies** | Phases that must be complete before this starts |
| **Acceptance Criteria** | Pass/fail conditions for phase sign-off |
| **Testing Checklist** | Specific tests that must pass |
| **Definition of Done** | All conditions that mark the phase complete |
| **Risks** | Technical or process risks specific to this phase |
| **Future Considerations** | Notes for later phases that touch this area |

---

## 2. Phase Overview

```
Phase 1   │ Monorepo Foundation
Phase 2   │ Shared Package
Phase 3   │ Database Foundation
Phase 4   │ Backend Core
Phase 5   │ Authentication
Phase 6   │ Project CRUD
Phase 7   │ Orchestrator Foundation
Phase 8   │ CEO Agent
Phase 9   │ PM Agent
Phase 10  │ Architect Agent
Phase 11  │ Approval Gates & Feedback
Phase 12  │ Document Generation
          ├─────────────────────────────────
Phase 13  │ Next.js Frontend
Phase 14  │ Auth & Dashboard Frontend
Phase 15  │ Project View Frontend
Phase 16  │ Real-Time Streaming
          ├─────────────────────────────────
Phase 17  │ UI Designer Agent
Phase 18  │ DB Engineer Agent
Phase 19  │ Backend Engineer Agent
Phase 20  │ Frontend Engineer Agent
Phase 21  │ QA Agent
Phase 22  │ DevOps & Docs Agents
          ├─────────────────────────────────
Phase 23  │ Team Management & Billing
Phase 24  │ MCP Server & Tools
Phase 25  │ MCP-Agent Integration
          ├─────────────────────────────────
Phase 26  │ Performance & Security Hardening
Phase 27  │ Production Infrastructure & Launch
```

**27 phases** across **five natural stage gates**:

| Stage | Phases | Gate |
|-------|--------|------|
| **Foundation** | 1–7 | CLI-tested backend with auth |
| **Core Pipeline** | 8–12 | End-to-end spec generation with approval |
| **Frontend** | 13–16 | Full UI with real-time streaming |
| **Engineering Agents** | 17–22 | Complete code generation for all layers |
| **Platform & Production** | 23–27 | Multi-tenant SaaS deployed to production |

---

## 3. Phase Details

---

### Phase 1 — Monorepo Foundation

| Section | Detail |
|---------|--------|
| **Objective** | Scaffold the monorepo with npm workspaces, shared tooling, and a working root build. |
| **Scope** | Repository structure only. No application logic, no database, no frontend pages. |
| **Dependencies** | None |

#### Features
1.1 Root `package.json` with npm workspaces pointing to `frontend/`, `backend/`, `shared/`
1.2 Base TypeScript configuration (`tsconfig.base.json`) with strict mode
1.3 ESLint flat config with TypeScript rules
1.4 Prettier configuration
1.5 `.gitignore` for Node, Next.js, env files
1.6 Root `dev`, `build`, `lint`, `typecheck`, `test` scripts

#### Deliverables
- Root `package.json`, `tsconfig.base.json`, `.eslintrc.cjs`, `.prettierrc`, `.gitignore`
- Empty `frontend/` directory with its own `package.json` and `tsconfig.json`
- Empty `backend/` directory with its own `package.json` and `tsconfig.json`
- Empty `shared/` directory with its own `package.json` and `tsconfig.json`
- `docs/` directory (pre-existing specification documents)

#### Files/Folders Created
```
package.json
tsconfig.base.json
.eslintrc.cjs
.prettierrc
.gitignore
frontend/
  package.json
  tsconfig.json
backend/
  package.json
  tsconfig.json
  .env.example
shared/
  package.json
  tsconfig.json
  src/
    index.ts
```

#### Acceptance Criteria
- [ ] `npm install` from root completes with zero errors
- [ ] `npm run typecheck -w backend` passes (empty project)
- [ ] `npm run typecheck -w frontend` passes (empty project)
- [ ] `npm run lint` passes
- [ ] `tsconfig.base.json` has `strict: true`

#### Testing Checklist
- [ ] `npm test` runs with zero errors (no tests yet, just no crash)
- [ ] `npm run typecheck` succeeds across all workspaces

#### Definition of Done
- All four package.json files exist and are valid
- TypeScript resolves across workspaces
- ESLint and Prettier produce no errors on valid files
- Root scripts run without failure

#### Risks
- npm workspace version compatibility with Next.js 16
- TypeScript project references complexity

#### Future Considerations
- Add Turborepo if build caching becomes necessary
- Consider `supabase` or other workspace orchestrator

---

### Phase 2 — Shared Package

| Section | Detail |
|---------|--------|
| **Objective** | Create the `@aisoftco/shared` package with all Zod validation schemas, TypeScript types, and constants shared between frontend and backend. |
| **Scope** | Shared types and schemas only. No runtime logic, no database access. |
| **Dependencies** | Phase 1 |

#### Features
2.1 Zod schemas for all API request/response bodies
2.2 TypeScript types for domain entities (User, Project, AgentOutput, etc.)
2.3 Enum-style constants for agent types, project statuses, phases
2.4 Shared API client base class
2.5 Error code constants

#### Deliverables
- `shared/src/schemas/` — Zod schema files
- `shared/src/types/` — TypeScript type definitions
- `shared/src/constants/` — Enum and constant definitions
- `shared/src/index.ts` — Barrel export

#### Files/Folders Created
```
shared/
  src/
    index.ts
    schemas/
      auth.ts
      project.ts
      agent.ts
      team.ts
      deployment.ts
      billing.ts
    types/
      index.ts
      project.ts
      agent.ts
      user.ts
      team.ts
      deployment.ts
    constants/
      index.ts
      agents.ts
      status.ts
      errors.ts
```

#### Acceptance Criteria
- [ ] All Zod schemas compile with strict TypeScript
- [ ] Types are importable from both `frontend/` and `backend/` as `@aisoftco/shared`
- [ ] `npm run typecheck` passes across all workspaces
- [ ] Zod schemas correctly validate valid/invalid inputs

#### Testing Checklist
- [ ] Unit tests for each Zod schema (valid input passes, invalid input fails with correct error)
- [ ] Type tests — ensure types are strict

#### Definition of Done
- Every schema has a corresponding unit test
- `npm run typecheck -w shared` passes
- No circular dependencies between shared modules

#### Risks
- Schema divergence between frontend and backend if shared package is not used consistently
- Zod version compatibility with React Hook Form resolvers

#### Future Considerations
- Generate OpenAPI spec from Zod schemas
- Add JSON Schema export for external consumers

---

### Phase 3 — Database Foundation

| Section | Detail |
|---------|--------|
| **Objective** | Define the complete Drizzle ORM schema, connect to Neon PostgreSQL, and create the migration pipeline. |
| **Scope** | Database schema only. No application code beyond connection and migration infrastructure. |
| **Dependencies** | Phase 2 |

#### Features
3.1 Drizzle table definitions for all 9 entities: users, teams, memberships, projects, agent_outputs, approvals, project_files, deployments, project_events
3.2 PostgreSQL enum type definitions
3.3 Neon serverless connection via `@neondatabase/serverless`
3.4 Drizzle Kit configuration for migration generation
3.5 Seed script with test data
3.6 All foreign keys, indexes, and unique constraints

#### Deliverables
- `backend/src/db/schema/` — All table schema files
- `backend/src/db/index.ts` — Drizzle client export
- `backend/src/db/enums.ts` — Enum definitions
- `backend/src/db/seed/seed.ts` — Seed script
- `drizzle.config.ts` — Drizzle Kit configuration
- Initial migration files

#### Files/Folders Created
```
backend/
  src/
    db/
      index.ts
      enums.ts
      schema/
        index.ts
        users.ts
        teams.ts
        memberships.ts
        projects.ts
        agent-outputs.ts
        approvals.ts
        project-files.ts
        deployments.ts
        project-events.ts
      migrations/
        0000_initial.sql
      seed/
        seed.ts
  drizzle.config.ts
```

#### Acceptance Criteria
- [ ] `npx drizzle-kit generate` produces valid SQL migration
- [ ] Migration applies to Neon database without errors
- [ ] All table schemas match the entity definitions in `05-Database-Architecture.md`
- [ ] Seed script inserts test data successfully
- [ ] `npx drizzle-kit studio` opens and shows tables

#### Testing Checklist
- [ ] Schema compilation test — all tables resolve
- [ ] Migration test — apply and rollback
- [ ] Seed integrity — all foreign key relationships work
- [ ] Query test — basic CRUD via Drizzle client works

#### Definition of Done
- Migration runs clean on fresh Neon database
- `npm run typecheck -w backend` passes
- Seed script populates database without constraint violations

#### Risks
- Neon connection pool exhaustion under load (mitigated by connection pooling configuration)
- Enum type compatibility between Drizzle and PostgreSQL

#### Future Considerations
- Add row-level security for multi-tenant data isolation
- Add audit trigger functions for all mutations

---

### Phase 4 — Backend Core

| Section | Detail |
|---------|--------|
| **Objective** | Build the Express.js application with full middleware stack, error handling, health endpoint, and structured logging. |
| **Scope** | HTTP serving infrastructure only. No business logic, no auth, no project endpoints. |
| **Dependencies** | Phase 3 |

#### Features
4.1 Express.js application factory with middleware configuration
4.2 Helmet.js security headers
4.3 CORS configuration (development defaults)
4.4 JSON body parser with size limit
4.5 Global error handler middleware
4.6 Structured JSON logging via Pino
4.7 Express request ID generation
4.8 Health check endpoint (`GET /api/v1/health`)
4.9 HTTP server bootstrap with graceful shutdown

#### Deliverables
- Express application with full middleware stack
- Health endpoint returning server status and DB connectivity
- Error handler converting all errors to standard JSON format
- Pino logger configured for development and production

#### Files/Folders Created
```
backend/
  src/
    config/
      index.ts
      database.ts
      cors.ts
      env.ts
    middleware/
      error-handler.ts
      logging.ts
      request-id.ts
    utils/
      logger.ts
      errors.ts
    routes/
      index.ts
      health.routes.ts
    controllers/
      health.controller.ts
    app.ts
    server.ts
```

#### Acceptance Criteria
- [ ] `GET /api/v1/health` returns `200 { "status": "healthy" }`
- [ ] Unknown route returns `404` with standard error format
- [ ] Error handler returns consistent `{ success, error, meta }` shape
- [ ] Server starts on configured port (default 3001)
- [ ] Graceful shutdown completes within 10 seconds

#### Testing Checklist
- [ ] Unit: error handler produces correct JSON shape
- [ ] Integration: health endpoint returns 200
- [ ] Integration: 404 for unknown route
- [ ] Integration: request ID present in response
- [ ] Integration: server starts and stops cleanly

#### Definition of Done
- `npm run dev` starts server on port 3001
- `curl http://localhost:3001/api/v1/health` returns healthy
- All tests pass
- `npm run typecheck -w backend` passes

#### Risks
- Express.js 4.x vs 5.x compatibility decisions
- CORS misconfiguration blocking frontend in later phases

#### Future Considerations
- Add OpenTelemetry instrumentation
- Add request/response body logging for debugging

---

### Phase 5 — Authentication

| Section | Detail |
|---------|--------|
| **Objective** | Implement JWT-based authentication: registration, email/password login, token refresh, logout, and auth middleware. |
| **Scope** | Auth endpoints and middleware only. No user profile endpoints, no role management. |
| **Dependencies** | Phase 4 |

#### Features
5.1 `POST /api/v1/auth/register` — Create account with email + hashed password
5.2 `POST /api/v1/auth/login` — Authenticate and return JWT pair
5.3 `POST /api/v1/auth/refresh` — Rotate refresh token
5.4 `POST /api/v1/auth/logout` — Invalidate refresh token
5.5 Auth middleware — Verify JWT and attach user to request
5.6 bcrypt password hashing with 12 salt rounds
5.7 RS256 JWT signing with configurable expiry

#### Deliverables
- Complete auth endpoint suite
- Auth middleware protecting downstream routes
- Token service for JWT creation and verification

#### Files/Folders Created
```
backend/
  src/
    routes/
      auth.routes.ts
      index.ts (updated)
    controllers/
      auth.controller.ts
    services/
      auth.service.ts
      token.service.ts
    middleware/
      auth.ts
    config/
      jwt.ts
```

#### Acceptance Criteria
- [ ] Register creates user and returns JWT pair
- [ ] Login with valid credentials returns JWT pair
- [ ] Login with invalid credentials returns 401
- [ ] Register with duplicate email returns 409
- [ ] Refresh token endpoint rotates tokens
- [ ] Auth middleware rejects missing/expired/invalid tokens
- [ ] Password is never returned in response
- [ ] Minimum password strength enforced (8+ chars, upper, lower, number, special)

#### Testing Checklist
- [ ] Unit: password hashing and verification
- [ ] Unit: JWT sign and verify
- [ ] Integration: register flow (201 + token shape)
- [ ] Integration: login with wrong password (401)
- [ ] Integration: protected route with no token (401)
- [ ] Integration: protected route with valid token (200)
- [ ] Integration: refresh token rotation

#### Definition of Done
- All auth endpoints tested and passing
- Auth middleware working on a protected test route
- No plaintext passwords in database
- Token expiry and refresh cycle verified

#### Risks
- Refresh token storage security (hashed in DB, never exposed beyond initial issuance)
- JWT secret rotation strategy not yet defined (deferred to Phase 26)

#### Future Considerations
- OAuth2 providers (Google, GitHub) integration
- SPA session management with httpOnly cookies

---

### Phase 6 — Project CRUD

| Section | Detail |
|---------|--------|
| **Objective** | Implement project creation, listing, detail view, soft-delete, and status management. |
| **Scope** | Project entity REST API only. No agent execution — orchestrator integration comes in Phase 7. |
| **Dependencies** | Phase 5 |

#### Features
6.1 `POST /api/v1/projects` — Create project from natural language
6.2 `GET /api/v1/projects` — List user's projects with pagination, search, filter
6.3 `GET /api/v1/projects/:id` — Project detail with agent outputs
6.4 `DELETE /api/v1/projects/:id` — Soft-delete project
6.5 `PATCH /api/v1/projects/:id` — Update project metadata
6.6 Zod validation on all inputs

#### Deliverables
- Complete project CRUD endpoints
- Pagination, sorting, and search middleware
- Soft-delete implementation

#### Files/Folders Created
```
backend/
  src/
    routes/
      project.routes.ts
      index.ts (updated)
    controllers/
      project.controller.ts
    services/
      project.service.ts
    middleware/
      validate.ts
      pagination.ts
```

#### Acceptance Criteria
- [ ] Create project returns 201 with project object (status: `draft`)
- [ ] Create project without auth returns 401
- [ ] List returns paginated projects owned by authenticated user
- [ ] List supports `?search=`, `?status=`, `?page=`, `?limit=`
- [ ] Get by ID returns project with all fields
- [ ] Get by ID for non-owned project returns 404
- [ ] Delete sets `deletedAt` timestamp
- [ ] Create with invalid description (under 100 chars) returns 400

#### Testing Checklist
- [ ] Unit: project service CRUD operations
- [ ] Integration: create → list → get → delete flow
- [ ] Integration: validation rejects invalid input
- [ ] Integration: soft-delete excludes from list queries

#### Definition of Done
- All project CRUD tests pass
- Project creation stores user input correctly
- Pagination returns correct count and page metadata
- Soft-delete works and does not hard-remove

#### Risks
- Description field length limits (100-5000 chars) may need adjustment based on LLM context needs
- Performance of listing with search on large text fields

#### Future Considerations
- Full-text search with PostgreSQL tsvector
- Bulk operations (export, archive)

---

### Phase 7 — Orchestrator Foundation

| Section | Detail |
|---------|--------|
| **Objective** | Build the agent orchestration engine: BullMQ queue, pipeline definition, agent executor shell, and project status transitions. |
| **Scope** | Orchestration infrastructure only. No agent-specific prompts or logic. |
| **Dependencies** | Phase 6 |

#### Features
7.1 BullMQ queue configuration with Redis
7.2 Pipeline stage definition (agent types, ordering, parallel flags)
7.3 Agent executor interface — wraps OpenAI API call
7.4 Project status transitions: `draft → running → (awaiting_approval | completed | failed)`
7.5 Pipeline start triggered on project creation
7.6 Basic worker that can execute a generic agent job
7.7 OpenAI client configuration

#### Deliverables
- BullMQ queue infrastructure
- Pipeline engine that sequences agent execution
- Agent executor that can run any agent by name
- Status management integrated with Project service

#### Files/Folders Created
```
backend/
  src/
    config/
      redis.ts
      openai.ts
    orchestrator/
      index.ts
      pipeline.ts
      agent-executor.ts
      context-builder.ts
    services/
      orchestrator.service.ts
```

#### Acceptance Criteria
- [ ] BullMQ worker starts and connects to Redis
- [ ] Pipeline definition is loaded and valid
- [ ] Creating a project triggers `orchestrator.startPipeline()`
- [ ] Project status transitions correctly
- [ ] Agent executor calls OpenAI API with correct parameters
- [ ] Failed agent job puts project in `failed` status

#### Testing Checklist
- [ ] Unit: pipeline definition completeness
- [ ] Unit: status transition validity
- [ ] Integration: project creation triggers queue job
- [ ] Integration: worker processes job and updates project
- [ ] Mocked: agent executor calls OpenAI with correct prompt

#### Definition of Done
- Creating a project enqueues a BullMQ job
- Worker dequeues and updates project status
- All tests pass with mocked OpenAI calls
- `npm run typecheck -w backend` passes

#### Risks
- Redis availability (mitigated by Upstash serverless Redis)
- OpenAI API latency blocking queue processing (mitigated by BullMQ concurrency settings)

#### Future Considerations
- Add BullMQ dashboard for queue monitoring
- Implement job prioritisation and scheduling

---

### Phase 8 — CEO Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the CEO AI agent that interprets the user's natural language description, asks clarifying questions, and produces a project charter. |
| **Scope** | CEO agent only. Single sequential step in the pipeline. |
| **Dependencies** | Phase 7 |

#### Features
8.1 CEO system prompt defining personality, constraints, output format
8.2 Clarifying question flow — agent asks user for missing details
8.3 Project charter output: vision, scope, target audience, success criteria, tech stack
8.4 Structured JSON output parsed and stored in `agent_outputs` table
8.5 Token tracking per agent execution

#### Deliverables
- CEO agent implementation
- System prompt template
- Output schema validation
- Pipeline stage wired to CEO agent

#### Files/Folders Created
```
backend/
  src/
    agents/
      ceo.agent.ts
      prompts/
        ceo.prompt.ts
    orchestrator/
      pipeline.ts (updated — wire CEO stage)
```

#### Acceptance Criteria
- [ ] CEO agent runs as the first pipeline stage
- [ ] Agent output is valid JSON matching expected schema
- [ ] Output is stored in `agent_outputs` table
- [ ] Project charter includes all required sections
- [ ] Agent execution time < 2 minutes
- [ ] Failed execution triggers retry with exponential backoff

#### Testing Checklist
- [ ] Unit: CEO prompt generation
- [ ] Unit: output schema validation
- [ ] Integration: full execution flow (mocked OpenAI)
- [ ] Integration: output stored correctly in DB

#### Definition of Done
- CEO agent produces consistent, structured output
- Output validates against shared Zod schema
- Pipeline advances past CEO stage
- All tests pass

#### Risks
- LLM hallucinates tech stack recommendations (mitigated by constrained output schema)
- User input too vague for meaningful output (mitigated by clarifying questions)

#### Future Considerations
- Multi-language support for user input
- CEO agent could reference similar projects from history

---

### Phase 9 — PM Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the Product Manager agent that reads CEO output and produces a complete PRD with user stories, feature prioritisation, and acceptance criteria. |
| **Scope** | PM agent only. Runs after CEO. Sequential. |
| **Dependencies** | Phase 8 |

#### Features
9.1 PM system prompt defining product management methodology
9.2 Context accumulation — receives full CEO output as context
9.3 PRD output: executive summary, personas, user stories, feature priority (MoSCoW), NFRs, metrics
9.4 User story mapping with acceptance criteria
9.5 Structured output stored in `agent_outputs` table

#### Deliverables
- PM agent implementation
- PRD generation logic
- Pipeline stage wired for PM agent

#### Files/Folders Created
```
backend/
  src/
    agents/
      pm.agent.ts
      prompts/
        pm.prompt.ts
    orchestrator/
      pipeline.ts (updated — wire PM stage)
```

#### Acceptance Criteria
- [ ] PM agent runs after CEO output is approved
- [ ] Agent produces valid PRD with all required sections
- [ ] User stories have clear acceptance criteria
- [ ] Features are prioritised with MoSCoW
- [ ] Context from CEO is correctly incorporated
- [ ] Output stored and retrievable

#### Testing Checklist
- [ ] Unit: context builder correctly accumulates CEO output
- [ ] Unit: PM output schema validation
- [ ] Integration: end-to-end CEO → PM flow (mocked)

#### Definition of Done
- PM agent produces complete, structured PRD
- All prior tests still pass
- Pipeline advances past PM stage

#### Risks
- Context window exceeded if CEO output is large (mitigated by token budgeting)
- Feature prioritisation may not match user expectations (mitigated by review gate)

#### Future Considerations
- Competitive analysis section in PRD
- Market size estimation

---

### Phase 10 — Architect Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the Software Architect agent that reads PRD and produces complete system architecture specifications (SRS, SDD, architecture docs). |
| **Scope** | Architect agent only. Sequential. Produces document content stored as structured data. |
| **Dependencies** | Phase 9 |

#### Features
10.1 Architect system prompt covering architectural patterns, technology decisions
10.2 Output generation for SRS, SDD, System Architecture, component design
10.3 Technology stack decision logic
10.4 Component decomposition and interface definition
10.5 Database schema design guidance (passed to DB Engineer later)

#### Deliverables
- Architect agent implementation
- Architecture document content generation
- Pipeline stage wired for Architect agent

#### Files/Folders Created
```
backend/
  src/
    agents/
      architect.agent.ts
      prompts/
        architect.prompt.ts
    orchestrator/
      pipeline.ts (updated — wire Architect stage)
```

#### Acceptance Criteria
- [ ] Architect agent runs after PM output is approved
- [ ] Output covers all architecture domains (system, data, API, frontend, backend, AI, MCP)
- [ ] Technology stack decisions are consistent with user preferences
- [ ] Output stored and retrievable
- [ ] Context from CEO and PM is incorporated

#### Testing Checklist
- [ ] Unit: architecture output schema validation
- [ ] Unit: context builder includes CEO + PM output
- [ ] Integration: end-to-end CEO → PM → Architect (mocked)

#### Definition of Done
- Architect produces complete architecture specification
- Output contains structured sections for each architecture domain
- Pipeline advances past Architect stage

#### Risks
- Hallucinated architecture decisions (mitigated by context grounding + MCP in Phase 25)
- Output too generic (mitigated by specific output schema requirements)

#### Future Considerations
- Architecture validation against best practices
- Cost estimation for recommended cloud services

---

### Phase 11 — Approval Gates & Feedback

| Section | Detail |
|---------|--------|
| **Objective** | Implement the approval gate mechanism that pauses the pipeline after each agent, allows user review, and supports feedback-driven re-execution. |
| **Scope** | Approval mechanism only. No changes to existing agents. |
| **Dependencies** | Phase 10 |

#### Features
11.1 `POST /api/v1/projects/:id/approve` — Approve current agent output
11.2 `POST /api/v1/projects/:id/reject` — Reject with feedback text
11.3 `GET /api/v1/projects/:id/gates` — List approval gates and their status
11.4 Pipeline pauses at `awaiting_approval` status after each agent
11.5 Rejection triggers agent re-execution with feedback injected into prompt
11.6 Maximum iteration limit (default 3) per agent
11.7 Approval history stored in `approvals` table

#### Deliverables
- Approval gate API endpoints
- Feedback processing in agent executor
- Pipeline pause/resume logic
- Iteration counting and limit enforcement

#### Files/Folders Created
```
backend/
  src/
    routes/
      agent.routes.ts
      index.ts (updated)
    controllers/
      agent.controller.ts
    services/
      agent.service.ts
    orchestrator/
      approval-gate.ts
      feedback-loop.ts
```

#### Acceptance Criteria
- [ ] Pipeline pauses after agent produces output
- [ ] Approve endpoint advances pipeline to next agent
- [ ] Reject endpoint triggers agent re-execution with feedback
- [ ] Exceeding max iterations moves to next agent (skips approval)
- [ ] Approval history stored in database
- [ ] Gate status available via project detail endpoint

#### Testing Checklist
- [ ] Unit: approval gate state machine
- [ ] Unit: feedback loop iteration counting
- [ ] Integration: approve and verify pipeline advancement
- [ ] Integration: reject and verify re-execution
- [ ] Integration: max iterations exhausted moves forward

#### Definition of Done
- Full approve/reject cycle working end-to-end
- Re-execution correctly injects user feedback into agent prompt
- Max iteration limit enforced
- All prior tests still pass

#### Risks
- Infinite loop if agent repeatedly produces unacceptable output (mitigated by max iteration cap)
- Feedback lost if agent does not incorporate it (mitigated by explicit feedback prompt injection)

#### Future Considerations
- Structured feedback (checklist-based) for more precise change requests
- Approval notification emails

---

### Phase 12 — Document Generation

| Section | Detail |
|---------|--------|
| **Objective** | Implement the service that takes structured agent outputs and writes them as formatted Markdown files to the `docs/` directory. |
| **Scope** | File generation logic only. No changes to agents or pipeline. |
| **Dependencies** | Phase 11 |

#### Features
12.1 Markdown template renderer for each document type
12.2 File writing service — creates `docs/` directory and files
12.3 Database metadata insertion in `project_files` table
12.4 Content formatting (tables, code blocks, headers)
12.5 Frontmatter generation (document control fields)

#### Deliverables
- File generation service
- Markdown templates per document type
- Integration with project output pipeline

#### Files/Folders Created
```
backend/
  src/
    services/
      file-generation.service.ts
    templates/
      prd.ts
      srs.ts
      sdd.ts
      system-architecture.ts
      database-architecture.ts
      api-architecture.ts
      ai-architecture.ts
      mcp-architecture.ts
      frontend-architecture.ts
      backend-architecture.ts
      coding-standards.ts
```

#### Acceptance Criteria
- [ ] Structured agent output is converted to valid Markdown
- [ ] Files are written to `docs/` with correct naming
- [ ] `project_files` table has entries for each generated file
- [ ] Markdown renders correctly in GitHub preview
- [ ] Document control frontmatter is present on each file
- [ ] Generation runs as part of the pipeline after each agent

#### Testing Checklist
- [ ] Unit: each template renders without error
- [ ] Unit: file writing creates correct directory structure
- [ ] Integration: full pipeline generates all 11 documents
- [ ] Integration: database entries match file count

#### Definition of Done
- All 11 architecture documents generated as Markdown
- Files render correctly on GitHub
- Database records match file system
- Pipeline completes end-to-end with all sequential agents

#### Risks
- Markdown formatting inconsistencies (mitigated by template-based approach)
- Large document sizes causing memory pressure (mitigated by stream writing)

#### Future Considerations
- PDF export option
- Interactive HTML documentation

---

### Phase 13 — Next.js Frontend

| Section | Detail |
|---------|--------|
| **Objective** | Scaffold the Next.js 16 application with App Router, Tailwind CSS, shadcn/ui, and the shared provider stack. |
| **Scope** | Frontend infrastructure only. No pages with business logic, no API integration. |
| **Dependencies** | Phase 2 (shared package) |

#### Features
13.1 Next.js 16 App Router configuration
13.2 Tailwind CSS installation and theme configuration
13.3 shadcn/ui component initialization
13.4 Radix UI primitives installation
13.5 Base CSS variables for light/dark themes
13.6 Theme provider (next-themes)
13.7 TanStack Query provider
13.8 Root layout with HTML structure
13.9 Loading states (global `loading.tsx`, `error.tsx`)
13.10 Font configuration (next/font)

#### Deliverables
- Working Next.js app on port 3000
- shadcn/ui component set (button, card, dialog, input, select, toast, skeleton)
- Provider hierarchy (Theme → Query → Auth)
- Responsive root layout

#### Files/Folders Created
```
frontend/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
      loading.tsx
      error.tsx
      not-found.tsx
      (auth)/
        layout.tsx
        loading.tsx
      (dashboard)/
        layout.tsx
        loading.tsx
    components/
      ui/
        button.tsx
        card.tsx
        dialog.tsx
        input.tsx
        select.tsx
        toast.tsx
        skeleton.tsx
      providers.tsx
      theme-provider.tsx
      query-provider.tsx
    lib/
      utils.ts
    providers/
      theme-provider.tsx
      query-provider.tsx
  tailwind.config.ts
  next.config.ts
  postcss.config.mjs
```

#### Acceptance Criteria
- [ ] `npm run dev -w frontend` starts on port 3000
- [ ] Home page renders without errors
- [ ] Dark/light theme toggle works
- [ ] shadcn/ui components render correctly
- [ ] Loading skeleton displays during page load
- [ ] Error boundary catches and displays errors
- [ ] Font is loaded and applied

#### Testing Checklist
- [ ] Unit: provider hierarchy renders without errors
- [ ] Unit: utility functions (`cn()`) work correctly
- [ ] E2E: page loads with no console errors

#### Definition of Done
- Frontend builds with `npm run build -w frontend`
- All shadcn/ui components render
- Theme switching works
- TypeScript strict mode passes

#### Risks
- Next.js 16 API differences from 14/15 (need to verify App Router patterns)
- shadcn/ui version compatibility with Next.js 16

#### Future Considerations
- Storybook for component development
- Visual regression testing with Chromatic

---

### Phase 14 — Auth & Dashboard Frontend

| Section | Detail |
|---------|--------|
| **Objective** | Build the login/register pages, auth context, API client, and dashboard project list page. |
| **Scope** | Frontend auth UI and project list only. No project detail, no real-time. |
| **Dependencies** | Phase 13, Phase 5 (auth API) |

#### Features
14.1 Login page with email/password form
14.2 Register page with validation
14.3 Auth context — stores JWT, auto-refreshes, provides `useAuth()` hook
14.4 API client class — wraps fetch with auth headers, error handling
14.5 Dashboard layout — sidebar navigation, header with user menu
14.6 Project list page — fetches and displays user's projects
14.7 Project card component — title, status badge, date
14.8 Project creation dialog — natural language input form
14.9 Loading skeletons for list and card

#### Deliverables
- Working login/register flow
- Authenticated dashboard with project list
- Project creation form
- API client integration with backend

#### Files/Folders Created
```
frontend/
  src/
    app/
      (auth)/
        login/page.tsx
        register/page.tsx
      (dashboard)/
        layout.tsx
        page.tsx
        projects/
          page.tsx
    components/
      layout/
        sidebar.tsx
        header.tsx
      project/
        project-card.tsx
        project-list.tsx
        project-form.tsx
    hooks/
      use-auth.ts
      use-projects.ts
    lib/
      api-client.ts
      auth-context.tsx
    providers/
      auth-provider.tsx
    middleware.ts
```

#### Acceptance Criteria
- [ ] Login with valid credentials redirects to dashboard
- [ ] Login with invalid credentials shows error message
- [ ] Register creates account and redirects to dashboard
- [ ] Unauthenticated user is redirected to login
- [ ] Dashboard shows user's projects (or empty state)
- [ ] Create project dialog opens, accepts input, creates project
- [ ] Project list updates after creation
- [ ] Sidebar navigation works

#### Testing Checklist
- [ ] Unit: auth context provides correct state
- [ ] Unit: API client adds auth header
- [ ] Integration: login form submits to backend
- [ ] E2E: register → create project → see in list
- [ ] E2E: unauthenticated access redirects

#### Definition of Done
- Full auth flow works end-to-end
- Dashboard renders project list from API
- Project creation works from UI
- All prior tests still pass

#### Risks
- CORS issues between frontend (3000) and backend (3001)
- Token refresh race conditions during page load

#### Future Considerations
- OAuth login buttons (Google, GitHub)
- Password reset flow

---

### Phase 15 — Project View Frontend

| Section | Detail |
|---------|--------|
| **Objective** | Build the project detail page showing agent timeline, output viewer, and approval panel. |
| **Scope** | Project view UI only. No real-time updates (Phase 16). |
| **Dependencies** | Phase 14 |

#### Features
15.1 Project detail page — header, status, metadata
15.2 Agent timeline — chronological list of agent runs with status indicators
15.3 Agent output viewer — renders structured agent output (JSON or Markdown)
15.4 Approval panel — approve/reject buttons with feedback textarea
15.5 File browser — list generated files with preview capability
15.6 Code viewer — syntax-highlighted file content display
15.7 Deployment panel — deploy button and status display

#### Deliverables
- Complete project detail page
- Agent output viewing
- Approval action UI
- Basic file browsing

#### Files/Folders Created
```
frontend/
  src/
    app/
      (dashboard)/
        projects/
          [id]/
            page.tsx
    components/
      project/
        project-status-badge.tsx
        agent-timeline.tsx
        agent-output-viewer.tsx
        approval-panel.tsx
        feedback-form.tsx
        file-browser.tsx
        code-viewer.tsx
        deployment-panel.tsx
    hooks/
      use-project.ts
      use-approval.ts
      use-deployment.ts
```

#### Acceptance Criteria
- [ ] Project detail loads and displays all metadata
- [ ] Agent timeline shows all executed agents with status
- [ ] Clicking an agent output renders its content
- [ ] Approve button sends request and advances view
- [ ] Reject button shows feedback form, sends request
- [ ] File browser lists generated files
- [ ] Code viewer displays file content with syntax highlighting
- [ ] Deployment panel shows current deploy status

#### Testing Checklist
- [ ] Unit: approval panel calls correct API
- [ ] Unit: agent timeline renders all statuses
- [ ] Integration: project detail loads with all relations
- [ ] E2E: view project → see timeline → approve → see next stage

#### Definition of Done
- All project view components render correctly
- Approval flow works end-to-end
- File browser loads and displays content
- All prior tests still pass

#### Risks
- Large agent output content causing slow renders (mitigated by lazy loading and pagination)
- Code viewer performance with very large files

#### Future Considerations
- Side-by-side diff view for agent revisions
- Markdown editor for inline feedback

---

### Phase 16 — Real-Time Streaming

| Section | Detail |
|---------|--------|
| **Objective** | Implement WebSocket-based real-time streaming of agent progress, thinking, and output from backend to frontend. |
| **Scope** | WebSocket infrastructure only. No changes to agent logic. |
| **Dependencies** | Phase 15 |

#### Features
16.1 Socket.IO server on backend (attached to HTTP server)
16.2 WebSocket authentication middleware (JWT token in query param)
16.3 Room-based subscriptions per project
16.4 Agent event emission: `agent:started`, `agent:thinking`, `agent:tool_use`, `agent:output`, `agent:awaiting_approval`, `agent:error`
16.5 Socket.IO client on frontend with auto-reconnect
16.6 Real-time agent progress card (animated)
16.7 Streaming text display (typewriter effect)
16.8 Tool use indicator showing active MCP tools
16.9 Connection status indicator
16.10 Redis adapter for multi-instance WebSocket scaling

#### Deliverables
- WebSocket server with project rooms
- Real-time agent progress UI on frontend
- Auto-reconnect handling with exponential backoff

#### Files/Folders Created
```
backend/
  src/
    ws/
      index.ts
      handlers.ts
      auth.ts
frontend/
  src/
    lib/
      socket.ts
    hooks/
      use-agent-stream.ts
    components/
      agent/
        agent-progress-card.tsx
        agent-streaming-text.tsx
        agent-thinking-bubble.tsx
        tool-use-indicator.tsx
```

#### Acceptance Criteria
- [ ] WebSocket connects with JWT authentication
- [ ] Joining project room receives that project's events only
- [ ] Agent progress events update UI in real time
- [ ] Streaming text displays output as it arrives
- [ ] Tool use events show which tools are being called
- [ ] Disconnect auto-reconnects without data loss
- [ ] Connection indicator shows online/offline status

#### Testing Checklist
- [ ] Unit: WebSocket auth middleware rejects invalid tokens
- [ ] Integration: connect → subscribe → receive events
- [ ] Integration: multiple clients in same room receive same events
- [ ] E2E: create project → watch real-time agent execution
- [ ] E2E: disconnect → reconnect → state recovers

#### Definition of Done
- Real-time streaming works end-to-end
- Frontend displays live agent progress
- Reconnection handles network interruptions
- All prior tests still pass

#### Risks
- Socket.IO memory pressure with many concurrent connections
- Event ordering if agents run in parallel

#### Future Considerations
- Connection health monitoring dashboard
- Historical event replay for disconnected clients

---

### Phase 17 — UI Designer Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the UI Designer agent that generates component trees, Radix UI component specifications, Tailwind theme configuration, and page layout specs. |
| **Scope** | UI Designer agent only. Runs in parallel with other engineering agents. |
| **Dependencies** | Phase 11 (approval gates), Phase 15 (project view) |

#### Features
17.1 UI Designer system prompt covering component composition, accessibility, responsive design
17.2 Output: component hierarchy tree, Radix UI component list, Tailwind theme config
17.3 Theme configuration generation (colors, typography, spacing)
17.4 Page layout specification
17.5 Responsive breakpoint definitions

#### Deliverables
- UI Designer agent implementation
- Component specification output
- Theme configuration file generation via file-gen service

#### Files/Folders Created
```
backend/
  src/
    agents/
      ui-designer.agent.ts
      prompts/
        ui-designer.prompt.ts
    orchestrator/
      pipeline.ts (updated — add parallel stage)
```

#### Acceptance Criteria
- [ ] Agent runs in parallel with other engineering agents
- [ ] Output includes complete component hierarchy
- [ ] Radix UI primitives are correctly specified for each component
- [ ] Tailwind theme config is valid and complete
- [ ] All prior agent context is incorporated

#### Testing Checklist
- [ ] Unit: output schema for component specification
- [ ] Unit: parallel execution does not block other agents
- [ ] Integration: full CEO→PM→Architect→UI flow

#### Definition of Done
- UI Designer produces valid component specifications
- Theme configuration can be directly used in tailwind.config.ts
- Pipeline correctly handles parallel execution stage

#### Risks
- Generated component tree may not match Radix UI API (mitigated by constrained prompts and Context7 lookup)
- Theme may not match brand expectations (mitigated by user approval gate)

#### Future Considerations
- Generate preview screenshots
- Accessibility audit of generated component specs

---

### Phase 18 — DB Engineer Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the Database Engineer agent that generates Drizzle ORM schema files, migration SQL, index definitions, and seed scripts. |
| **Scope** | DB Engineer agent only. Runs in parallel with other engineering agents. |
| **Dependencies** | Phase 17 |

#### Features
18.1 DB Engineer system prompt covering Drizzle ORM patterns, PostgreSQL optimisation
18.2 Output: table definitions, enums, indexes, relations, migrations, seed data
18.3 Schema file generation — writes Drizzle schema `.ts` files
18.4 Migration SQL generation — writes raw SQL migration files
18.5 Index and constraint generation
18.6 Seed data generation — writes seed script

#### Deliverables
- DB Engineer agent implementation
- Drizzle schema file generation
- Migration and seed script generation

#### Files/Folders Created
```
backend/
  src/
    agents/
      db-engineer.agent.ts
      prompts/
        db-engineer.prompt.ts
```

#### Acceptance Criteria
- [ ] Agent produces valid Drizzle schema definitions
- [ ] Generated schema compiles with TypeScript strict mode
- [ ] Migration SQL is syntactically valid PostgreSQL
- [ ] Seed script populates tables with realistic data
- [ ] Foreign keys and indexes are correctly defined

#### Testing Checklist
- [ ] Unit: generated schema compiles
- [ ] Unit: migration SQL passes basic parsing
- [ ] Integration: generated schema can be applied to Neon
- [ ] Integration: seed script runs without constraint violations

#### Definition of Done
- DB Engineer generates compilable Drizzle schemas
- Migration files are valid PostgreSQL
- Seed script populates database cleanly
- Pipeline completes parallel stage successfully

#### Risks
- Generated schema may miss edge case constraints (mitigated by validation before file write)
- Complex relationships may confuse the LLM (mitigated by providing schema patterns in prompt)

#### Future Considerations
- Migration rollback scripts
- Performance optimisation suggestions based on query patterns

---

### Phase 19 — Backend Engineer Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the Backend Engineer agent that generates a complete Express.js MVC application with routes, controllers, services, middleware, and validation. |
| **Scope** | Backend Engineer agent only. Runs in parallel. |
| **Dependencies** | Phase 18 |

#### Features
19.1 Backend Engineer system prompt for Express.js + TypeScript patterns
19.2 Route generation — RESTful endpoint definitions
19.3 Controller generation — request handling, response formatting
19.4 Service generation — business logic layer
19.5 Middleware generation — auth, validation, error handling
19.6 Zod schema integration
19.7 Configuration files — database, environment, CORS
19.8 Entry point — `server.ts`, `app.ts`

#### Deliverables
- Backend Engineer agent implementation
- Complete Express.js MVC code generation
- File writing integrated with file-generation service

#### Files/Folders Created
```
backend/
  src/
    agents/
      backend-engineer.agent.ts
      prompts/
        backend-engineer.prompt.ts
```

#### Acceptance Criteria
- [ ] Agent generates complete backend directory structure
- [ ] Generated code compiles with TypeScript strict mode
- [ ] Generated Express app starts without errors
- [ ] All CRUD endpoints are correctly implemented
- [ ] Zod validation is applied to all inputs
- [ ] Error handling middleware is present
- [ ] Auth middleware is correctly integrated

#### Testing Checklist
- [ ] Unit: generated code compiles
- [ ] Integration: generated app starts and responds to requests
- [ ] Integration: generated endpoints return correct status codes
- [ ] Integration: validation rejects invalid input

#### Definition of Done
- Backend Engineer generates a working Express.js application
- Generated code passes TypeScript strict mode
- Generated app passes all HTTP smoke tests
- Pipeline completes parallel stage

#### Risks
- Code quality may vary between runs (mitigated by prompt engineering + output validation)
- Generated code may contain security vulnerabilities (mitigated by Phase 26 security audit)

#### Future Considerations
- Generate OpenAPI/Swagger documentation alongside code
- Generate unit tests for generated services

---

### Phase 20 — Frontend Engineer Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the Frontend Engineer agent that generates a complete Next.js application with pages, components, API client hooks, and Tailwind styling. |
| **Scope** | Frontend Engineer agent only. Runs in parallel. |
| **Dependencies** | Phase 19 |

#### Features
20.1 Frontend Engineer system prompt for Next.js 16 + shadcn/ui patterns
20.2 Page generation — all routes with server/client component split
20.3 Component generation — shadcn/ui composition, Radix UI primitives
20.4 API client generation — TanStack Query hooks
20.5 Form generation — React Hook Form with Zod resolver
20.6 Theme and styling — Tailwind CSS classes
20.7 Layout and navigation components

#### Deliverables
- Frontend Engineer agent implementation
- Complete Next.js code generation
- File writing integration

#### Files/Folders Created
```
backend/
  src/
    agents/
      frontend-engineer.agent.ts
      prompts/
        frontend-engineer.prompt.ts
```

#### Acceptance Criteria
- [ ] Agent generates complete frontend directory structure
- [ ] Generated code builds with `next build` (zero errors)
- [ ] All pages render without runtime errors
- [ ] API client correctly connects to generated backend
- [ ] Forms include Zod validation
- [ ] Components use shadcn/ui correctly

#### Testing Checklist
- [ ] Unit: generated code compiles
- [ ] Integration: `next build` succeeds
- [ ] Integration: generated pages render (no crash)
- [ ] Visual: generated components match expected Radix UI patterns

#### Definition of Done
- Frontend Engineer generates a working Next.js application
- Generated code builds successfully
- Generated pages render without errors
- Pipeline completes parallel stage

#### Risks
- Generated JSX may use incorrect Radix UI API (mitigated by Context7 documentation lookup)
- Bundle size may be large (mitigated by code review in Phase 26)

#### Future Considerations
- Generate E2E tests for all pages
- Generate Storybook stories for all components

---

### Phase 21 — QA Agent

| Section | Detail |
|---------|--------|
| **Objective** | Implement the QA Engineer agent that generates test plans, unit tests, integration tests, and E2E tests for the generated application. |
| **Scope** | QA agent only. Runs after all engineering agents complete. Sequential. |
| **Dependencies** | Phase 20 |

#### Features
21.1 QA Engineer system prompt for testing methodology
21.2 Test plan generation — identifies test cases from requirements
21.3 Unit test generation — Vitest tests for services and utilities
21.4 Integration test generation — Supertest tests for API endpoints
21.5 E2E test generation — Playwright tests for critical flows
21.6 Test configuration files — `vitest.config.ts`, `playwright.config.ts`

#### Deliverables
- QA agent implementation
- Test suite generation
- Test configuration files

#### Files/Folders Created
```
backend/
  src/
    agents/
      qa.agent.ts
      prompts/
        qa.prompt.ts
```

#### Acceptance Criteria
- [ ] Agent generates test plan document covering all features
- [ ] Unit tests run and pass against generated backend code
- [ ] Integration tests run and pass against generated API
- [ ] E2E tests run and pass against generated frontend
- [ ] Test configuration files are valid

#### Testing Checklist
- [ ] Unit: generated tests are syntactically valid
- [ ] Integration: generated unit tests pass
- [ ] Integration: generated integration tests pass
- [ ] E2E: generated Playwright tests run

#### Definition of Done
- QA agent produces a comprehensive test suite
- Generated tests pass when run
- Test coverage report shows > 70% coverage
- Pipeline completes QA stage

#### Risks
- Generated tests may be too simplistic (mitigated by test quality prompts)
- Tests may fail due to timing issues (mitigated by proper async handling in tests)

#### Future Considerations
- Security test generation (OWASP ZAP scripts)
- Performance test generation (k6 scripts)

---

### Phase 22 — DevOps & Docs Agents

| Section | Detail |
|---------|--------|
| **Objective** | Implement the DevOps Engineer agent (Docker, CI/CD, deploy configs) and Documentation Engineer agent (README, deployment guide, API docs). |
| **Scope** | Both agents run sequentially. No changes to previous agents. |
| **Dependencies** | Phase 21 |

#### Features
22.1 DevOps system prompt for containerization and deployment
22.2 Dockerfile and docker-compose.yml generation
22.3 CI/CD pipeline generation (GitHub Actions)
22.4 Vercel configuration (vercel.json)
22.5 Environment variable template (.env.example)
22.6 Documentation system prompt for technical writing
22.7 README generation — project overview, quick start, tech stack
22.8 Deployment guide generation
22.9 API reference documentation generation
22.10 Contributing guide generation

#### Deliverables
- DevOps agent implementation
- Documentation agent implementation
- Generated configuration files and documentation

#### Files/Folders Created
```
backend/
  src/
    agents/
      devops.agent.ts
      documentation.agent.ts
      prompts/
        devops.prompt.ts
        documentation.prompt.ts
```

#### Acceptance Criteria
- [ ] DevOps generates valid Dockerfile (multi-stage)
- [ ] Dockerfile produces a working container
- [ ] CI workflow runs lint → typecheck → test → build
- [ ] Vercel config is valid
- [ ] Documentation includes README, DEPLOYMENT, CONTRIBUTING
- [ ] All documentation renders correctly as Markdown
- [ ] API reference documents all public endpoints

#### Testing Checklist
- [ ] Unit: Dockerfile syntax validation
- [ ] Integration: docker-compose builds and starts
- [ ] Integration: CI workflow files are valid YAML
- [ ] E2E: generated README renders without broken links

#### Definition of Done
- DevOps produces deployable configuration
- Documentation covers all required sections
- Full pipeline now complete through all 10 agents
- End-to-end spec-to-docs pipeline verified

#### Risks
- Dockerfile may not account for all runtime dependencies (mitigated by build verification)
- Documentation may contain placeholder content (mitigated by prompt quality)

#### Future Considerations
- Terraform/Pulumi infrastructure-as-code generation
- Interactive API documentation (Swagger UI)

---

### Phase 23 — Team Management & Billing

| Section | Detail |
|---------|--------|
| **Objective** | Implement team management (CRUD, memberships, roles) and Stripe billing integration (subscriptions, checkout, webhooks). |
| **Scope** | Multi-tenant and monetisation features only. No changes to agent pipeline. |
| **Dependencies** | Phase 22 (but can run in parallel with Phases 17-22) |

#### Features
23.1 Team CRUD — create, list, get, update, delete
23.2 Membership management — invite, accept, remove, role change
23.3 Role-based access control on projects (owner, admin, member, viewer)
23.4 Project team scoping
23.5 Stripe subscription plans (free / pro / enterprise)
23.6 Stripe checkout session creation
23.7 Stripe webhook handling (subscription events)
23.8 Frontend team management UI
23.9 Frontend billing UI (plan display, subscription management)

#### Deliverables
- Team management backend + frontend
- RBAC integration with project access
- Stripe billing integration

#### Files/Folders Created
```
backend/
  src/
    routes/
      team.routes.ts
      billing.routes.ts
      index.ts (updated)
    controllers/
      team.controller.ts
      billing.controller.ts
    services/
      team.service.ts
      billing.service.ts
frontend/
  src/
    app/
      (dashboard)/
        teams/
          page.tsx
          [id]/
            page.tsx
        settings/
          page.tsx
          billing/
            page.tsx
    components/
      team/
        team-card.tsx
        member-list.tsx
        invite-form.tsx
    hooks/
      use-teams.ts
      use-billing.ts
```

#### Acceptance Criteria
- [ ] Team creation and member invitation work
- [ ] Role-based access restricts project operations
- [ ] Owner can transfer ownership
- [ ] Stripe checkout creates subscription
- [ ] Webhook updates subscription status
- [ ] Free tier has feature limitations enforced
- [ ] Frontend displays correct plan and usage

#### Testing Checklist
- [ ] Unit: RBAC permission checks for each role
- [ ] Integration: invite → accept → access flow
- [ ] Integration: Stripe webhook processing
- [ ] E2E: create team → invite member → verify access

#### Definition of Done
- Teams work end-to-end with correct permission enforcement
- Stripe integration processes subscriptions and webhooks
- Frontend pages for teams and billing are functional
- All prior tests still pass

#### Risks
- Stripe webhook signature verification misconfiguration
- RBAC edge cases (member removed while project running)

#### Future Considerations
- Usage-based billing (per project or per agent execution)
- Annual subscription discounts

---

### Phase 24 — MCP Server & Tools

| Section | Detail |
|---------|--------|
| **Objective** | Build the MCP (Model Context Protocol) server with tool registration, file system tools, Context7 documentation lookup, and code analysis tools. |
| **Scope** | MCP server only. Integration with agents comes in Phase 25. |
| **Dependencies** | Phase 2 (shared types) |

#### Features
24.1 MCP protocol implementation (JSON-RPC 2.0)
24.2 HTTP/SSE transport layer
24.3 Tool registry and dispatch
24.4 `read_file` — read file contents within project directory
24.5 `write_file` — write file contents to project directory
24.6 `list_directory` — list files in a directory
24.7 `search_code` — regex search across project files
24.8 `execute_command` — sandboxed shell execution (whitelisted commands)
24.9 `resolve_library_id` — Context7 library resolution
24.10 `query_docs` — Context7 documentation query
24.11 `lint_code` — ESLint wrapper
24.12 `type_check` — TypeScript compiler wrapper
24.13 Resource URI handlers (project context, agent outputs)
24.14 Auth middleware for tool access control
24.15 Path traversal protection

#### Deliverables
- MCP server implementation
- 12 tool implementations
- Sandboxing and security controls

#### Files/Folders Created
```
backend/
  src/
    mcp/
      index.ts
      server.ts
      types.ts
      transport/
        http.ts
        stdio.ts
      tools/
        registry.ts
        file-system.ts
        context7.ts
        code-analysis.ts
        shell.ts
      resources/
        provider.ts
        project-context.ts
      middleware/
        auth.ts
        error-handler.ts
        logging.ts
```

#### Acceptance Criteria
- [ ] MCP server starts and responds to `initialize`
- [ ] All 12 tools are registered and callable
- [ ] `read_file` returns file content within project boundary
- [ ] `write_file` creates files and directories
- [ ] Path traversal attempts are blocked
- [ ] Shell execution only allows whitelisted commands
- [ ] Context7 tools return valid documentation
- [ ] Code analysis tools return valid lint/type results

#### Testing Checklist
- [ ] Unit: tool registry contains all 12 tools
- [ ] Unit: path traversal protection blocks `../` patterns
- [ ] Integration: each tool call returns expected shape
- [ ] Integration: shell execution rejects non-whitelisted commands
- [ ] Integration: Context7 tools return valid responses

#### Definition of Done
- MCP server fully functional and tested
- All 12 tools work correctly
- Security controls prevent unauthorised access and injection
- Server can run as standalone process

#### Risks
- Context7 API rate limits (mitigated by response caching)
- Shell execution security — whitelisted commands may still have vulnerabilities

#### Future Considerations
- Dynamic tool loading from plugins
- Tool execution metrics and monitoring

---

### Phase 25 — MCP-Agent Integration

| Section | Detail |
|---------|--------|
| **Objective** | Integrate the MCP server with the agent pipeline, replacing direct tool calls with MCP-based tool invocations via the OpenAI Agents SDK. |
| **Scope** | Agent tool layer only. No changes to agent prompts or pipeline logic. |
| **Dependencies** | Phase 24, Phase 7 |

#### Features
25.1 MCP client wrapper in orchestrator
25.2 Tool conversion — MCP tool definitions → OpenAI Agents SDK Tool objects
25.3 Agent configuration update — add MCP tools to all agents
25.4 Remove direct tool implementations (replace with MCP calls)
25.5 Connection pooling and caching for MCP calls
25.6 Fallback strategy when MCP server is unavailable
25.7 Performance comparison (direct vs MCP)

#### Deliverables
- MCP client integration with orchestrator
- All agents using MCP tools
- Caching and connection management

#### Files/Folders Created
```
backend/
  src/
    mcp/
      client.ts
      tools.ts
    orchestrator/
      agent-executor.ts (updated)
```

#### Acceptance Criteria
- [ ] Agents call MCP tools instead of direct implementations
- [ ] Tool results are correctly incorporated into agent context
- [ ] MCP server failure does not crash the pipeline (graceful degradation)
- [ ] Caching reduces duplicate Context7 lookups
- [ ] Agent execution time does not increase significantly

#### Testing Checklist
- [ ] Unit: MCP client sends correctly formatted requests
- [ ] Integration: agent with MCP tools produces same output quality
- [ ] Integration: MCP server failure triggers fallback
- [ ] Performance: MCP latency adds less than 500ms per tool call

#### Definition of Done
- All agents use MCP tools for file system, Context7, and code analysis
- MCP client handles connection, caching, and errors
- Agent output quality is maintained (or improved)
- All prior tests still pass

#### Risks
- MCP call overhead increases agent execution time
- JSON-RPC serialisation may cause issues with large payloads

#### Future Considerations
- Streaming MCP responses for large file reads
- MCP resource subscriptions for real-time file change notifications

---

### Phase 26 — Performance & Security Hardening

| Section | Detail |
|---------|--------|
| **Objective** | Optimise platform performance across all layers and harden security through SAST, dependency auditing, and penetration testing. |
| **Scope** | Non-functional improvements only. No feature changes. |
| **Dependencies** | Phase 25 |

#### Features
26.1 LLM token budget optimisation per agent
26.2 Response caching (Redis) for frequent API queries
26.3 Database query optimisation — missing indexes, slow query analysis
26.4 Database connection pooling configuration (pgBouncer)
26.5 Frontend bundle analysis and size reduction
26.6 Dynamic imports for heavy client components
26.7 Image and font optimisation
26.8 OWASP security scan (ZAP)
26.9 SAST analysis (SonarQube or equivalent)
26.10 `npm audit` fix for all dependencies
26.11 Prompt injection testing and mitigation
26.12 CORS, CSP, and security headers audit
26.13 Rate limiting effectiveness verification

#### Deliverables
- Performance optimisation report
- Security audit report with zero critical findings
- Hardened configuration across all layers

#### Files/Folders Created
```
backend/
  src/
    config/
      cache.ts
    middleware/
      cache.ts
frontend/
  next.config.ts (updated — bundle analyser, image config)
```

#### Acceptance Criteria
- [ ] API p95 response time < 200ms
- [ ] Frontend Lighthouse score > 90 (performance)
- [ ] First load JS bundle < 150KB
- [ ] Zero critical/high vulnerabilities in `npm audit`
- [ ] OWASP ZAP scan passes with zero high-risk findings
- [ ] Rate limiting blocks abusive requests correctly
- [ ] CSP headers are set and functional
- [ ] Prompt injection attempts are blocked

#### Testing Checklist
- [ ] Performance: k6 load test — 100 concurrent users, 5 min
- [ ] Performance: Lighthouse CI — all categories > 90
- [ ] Security: OWASP ZAP active scan — zero high findings
- [ ] Security: `npm audit` — zero critical/high
- [ ] Security: Prompt injection fuzzing — all attempts blocked

#### Definition of Done
- All performance targets met
- Security audit passes with zero critical/high findings
- Rate limiting and CSP configured
- All prior tests still pass

#### Risks
- Performance optimisation may conflict with code readability
- Security fixes may require breaking changes

#### Future Considerations
- Regular (monthly) security audit schedule
- Bug bounty program

---

### Phase 27 — Production Infrastructure & Launch

| Section | Detail |
|--------|--------|
| **Objective** | Deploy the platform to production: Vercel deployment, Neon production database, monitoring, alerting, and launch verification. |
| **Scope** | Production operations only. No feature changes. |
| **Dependencies** | Phase 26 |

#### Features
27.1 Vercel project configuration (frontend + backend serverless functions)
27.2 Neon production database branch with connection pooling
27.3 Environment variable management (Vercel Environment Variables)
27.4 Custom domain configuration (DNS, SSL)
27.5 Sentry error tracking setup
27.6 Log aggregation (Vercel Logs / Logtail)
27.7 Uptime monitoring (Better Uptime or similar)
27.8 Alert configuration (Slack, email)
27.9 CI/CD pipeline — automated deploy on main
27.10 Preview deployments for pull requests
27.11 Load testing (k6) — 250 concurrent users, 5 min
27.12 Launch smoke tests — all critical flows verified
27.13 Rollback procedure documentation
27.14 Incident response runbook

#### Deliverables
- Production deployment on Vercel
- Monitoring and alerting configured
- CI/CD pipeline operational
- Launch verification checklist completed

#### Files/Folders Created
```
vercel.json (project root)
.github/
  workflows/
    ci.yml
    deploy.yml
```

#### Acceptance Criteria
- [ ] `https://app.aisoftco.com` loads and is functional
- [ ] `https://api.aisoftco.com/api/v1/health` returns healthy
- [ ] Neon production DB is connected and responsive
- [ ] Sentry captures errors correctly
- [ ] CI runs lint → typecheck → test → build for every PR
- [ ] Deploy happens automatically on main merge
- [ ] Preview deployments work for PR branches
- [ ] Load test: 250 concurrent users, < 2s p95 response
- [ ] Rollback completes in under 15 minutes
- [ ] All launch smoke tests pass

#### Testing Checklist
- [ ] Smoke: register → login → create project → full pipeline
- [ ] Smoke: approve/reject → feedback loop
- [ ] Smoke: team creation → invitation → role-based access
- [ ] Smoke: deploy generated project to Vercel
- [ ] Performance: k6 load test passes SLOs
- [ ] Recovery: rollback procedure tested

#### Definition of Done
- Platform is live on production domain
- Monitoring and alerting are operational
- CI/CD pipeline is active
- Load tests pass within SLOs
- Runbook is documented and accessible
- All 27 phases complete — platform is production-ready

#### Risks
- Vercel serverless function cold starts causing latency spikes
- Neon database connection pool exhaustion under load
- DNS propagation delays after domain configuration

#### Future Considerations
- Multi-region deployment for disaster recovery
- SOC 2 compliance audit
- Dedicated enterprise instance option

---

## 4. Dependency Graph

```
Phase 1   ──► Phase 2   ──► Phase 3   ──► Phase 4   ──► Phase 5   ──► Phase 6
                                                                          │
                                                                          ▼
                              Phase 12 ◄── Phase 11 ◄── Phase 10 ◄── Phase 9 ◄── Phase 8 ◄── Phase 7
                                                                          │
                                                                          ▼
                              Phase 13 ──► Phase 14 ──► Phase 15 ──► Phase 16
                                                                          │
                                                                          ▼
            Phase 18 ◄── Phase 17                                           │
                │           │                                              │
                ▼           ▼                                              │
            Phase 19 ──► Phase 20 ──► Phase 21 ──► Phase 22                │
                │                       │                  │                │
                └───────────────────────┴──────────────────┘                │
                                    │                                      │
                                    ▼                                      │
                              Phase 23 (independent, can run               │
                                        concurrently with 17-22)           │
                                                                           │
                              Phase 24 ──► Phase 25 ──► Phase 26 ──► Phase 27
```

---

## 5. Key Milestones

| Milestone | Phase | Week | Deliverable |
|-----------|-------|------|-------------|
| Backend operational | 4 | 2 | Express server with health endpoint |
| Auth working | 5 | 3 | Login/register/token refresh |
| Project CRUD | 6 | 4 | Create, list, get, delete projects |
| Orchestrator running | 7 | 5 | BullMQ queue processing agent jobs |
| CEO Agent produces output | 8 | 5 | Project charter generated |
| End-to-end spec pipeline | 12 | 7 | CEO→PM→Architect→Docs→Approval |
| Frontend operational | 13 | 8 | Next.js app with providers |
| Dashboard live | 14 | 9 | Login → dashboard → create project |
| Real-time streaming | 16 | 10 | Live agent progress visible in browser |
| Engineering agents complete | 22 | 16 | All 10 agents produce valid output |
| Multi-tenant with billing | 23 | 18 | Teams + Stripe subscriptions |
| MCP server operational | 24 | 19 | MCP tools callable |
| MCP-agent integration | 25 | 20 | All agents use MCP tools |
| Performance & security | 26 | 22 | All targets met |
| Production launch | 27 | 24 | Platform live on production |

---

## 6. Risk Registry

| Risk | Phase(s) | Impact | Likelihood | Mitigation |
|------|----------|--------|------------|------------|
| OpenAI API outage | 8-12, 17-22 | Critical — pipeline halts | Low | BullMQ retry, status page, fallback model |
| LLM output quality below threshold | 8-12 | High — user dissatisfaction | Medium | Approval gates, feedback loops, prompt tuning |
| Agent cost overruns | 8-22 | Medium — budget exceeded | Medium | Token budgeting, caching, model selection |
| Neon DB scaling issues | All | Medium — performance degradation | Low | Connection pooling, read replicas, monitoring |
| WebSocket connection limits | 16 | Medium — real-time degraded | Low | Redis adapter, horizontal scaling, connection limits |
| MCP server latency | 24-25 | Medium — slower agent execution | Medium | Connection pooling, tool response caching |
| Vercel cold starts | 27 | Low — initial request latency | Medium | Serverless function warm-up, edge functions |
| Prompt injection | 8-22 | Critical — security breach | Low | Input sanitisation, system prompt hardening, output validation |

---

## 7. Phase Validation Matrix

| Phase | Single Responsibility | Independently Testable | Working App at End | No Mixed Features | Builds on Prior |
|-------|----------------------|----------------------|---------------------|-------------------|-----------------|
| 1 | ✓ | ✓ | ✓ | ✓ | — |
| 2 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 3 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 4 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 5 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 6 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 7 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 8 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 9 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 10 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 11 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 12 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 13 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 14 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 15 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 16 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 17 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 18 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 19 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 20 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 21 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 22 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 23 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 24 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 25 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 26 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 27 | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 8. Quick Reference

### Phase Summary Table

| # | Phase | Stage | Est. Effort | Key Deliverable |
|---|-------|-------|-------------|-----------------|
| 1 | Monorepo Foundation | Foundation | 2 days | Repository structure |
| 2 | Shared Package | Foundation | 3 days | Zod schemas + types |
| 3 | Database Foundation | Foundation | 3 days | Drizzle schema + migrations |
| 4 | Backend Core | Foundation | 3 days | Express server + middleware |
| 5 | Authentication | Foundation | 4 days | JWT auth endpoints |
| 6 | Project CRUD | Foundation | 3 days | Project REST API |
| 7 | Orchestrator Foundation | Foundation | 4 days | BullMQ + pipeline engine |
| 8 | CEO Agent | Core Pipeline | 3 days | CEO agent |
| 9 | PM Agent | Core Pipeline | 3 days | PM agent |
| 10 | Architect Agent | Core Pipeline | 4 days | Architect agent |
| 11 | Approval Gates & Feedback | Core Pipeline | 3 days | Approve/reject API |
| 12 | Document Generation | Core Pipeline | 3 days | Markdown file output |
| 13 | Next.js Frontend | Frontend | 3 days | Next.js app + shadcn/ui |
| 14 | Auth & Dashboard Frontend | Frontend | 4 days | Login + dashboard UI |
| 15 | Project View Frontend | Frontend | 4 days | Project detail + approval UI |
| 16 | Real-Time Streaming | Frontend | 4 days | WebSocket + live agent UI |
| 17 | UI Designer Agent | Engineering | 4 days | UI component spec |
| 18 | DB Engineer Agent | Engineering | 4 days | Drizzle schema generation |
| 19 | Backend Engineer Agent | Engineering | 6 days | Express.js code generation |
| 20 | Frontend Engineer Agent | Engineering | 6 days | Next.js code generation |
| 21 | QA Agent | Engineering | 4 days | Test suite generation |
| 22 | DevOps & Docs Agents | Engineering | 4 days | Config + documentation |
| 23 | Team Management & Billing | Platform | 5 days | Multi-tenant + Stripe |
| 24 | MCP Server & Tools | Production | 5 days | MCP protocol + tools |
| 25 | MCP-Agent Integration | Production | 3 days | MCP tool integration |
| 26 | Performance & Security | Production | 5 days | Optimisation + audit |
| 27 | Production Launch | Production | 5 days | Live deployment |

**Total estimated effort: ~100 working days (~20 weeks for a team of 2-3 engineers)**
