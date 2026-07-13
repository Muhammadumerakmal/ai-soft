# Software Requirements Specification — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | SRS-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the AI Software Company platform — a multi-agent AI orchestration system that generates production-grade software projects from natural language descriptions.

### 1.2 Scope
The platform encompasses:
- A web-based frontend for project creation and monitoring
- A backend API for agent orchestration and project management
- A multi-agent AI execution engine
- An MCP (Model Context Protocol) server for tool-augmented agent reasoning
- Database persistence with Neon PostgreSQL and Drizzle ORM
- CI/CD and deployment pipelines targeting Vercel

### 1.3 Definitions & Acronyms
| Term | Definition |
|------|------------|
| **Agent** | An AI-powered entity with a specific role (CEO, PM, Architect, etc.) |
| **Orchestrator** | The engine that manages agent lifecycle, sequencing, and communication |
| **MCP** | Model Context Protocol — standardised protocol for LLM tool access |
| **Approval Gate** | A user-intervention point where human approval is required before proceeding |
| **Project** | The unit of work — a single software idea being built |
| **Pipeline** | The ordered sequence of agent executions for a project |

### 1.4 References
| Document | Description |
|----------|-------------|
| PRD-001 | Product Requirements Document |
| SDD-001 | Software Design Document |
| API-SPEC-001 | API Specification |

---

## 2. Overall Description

### 2.1 Product Perspective
The platform is a new, self-contained SaaS product. It does not depend on existing legacy systems. It integrates with:
- **OpenAI API** — LLM inference for all agents
- **Neon PostgreSQL** — Primary data store
- **Vercel** — Deployment target for generated projects
- **GitHub (optional)** — Source control for generated code
- **Stripe** — Payment processing (Phase 2)

### 2.2 User Characteristics
| User Type | Technical Level | Frequency | Primary Actions |
|-----------|----------------|-----------|-----------------|
| Anonymous Visitor | Low | Once | View landing page, sign up |
| Free-tier User | Low-Medium | Weekly | Create projects, review output |
| Pro-tier User | Medium-High | Daily | Full pipeline access, team collaboration |
| Admin | High | As needed | System monitoring, user management |

### 2.3 Operating Environment
- **Frontend**: Modern browsers (Chrome 120+, Firefox 115+, Safari 17+, Edge 120+)
- **Backend**: Node.js 20+ LTS runtime
- **Database**: PostgreSQL 16 (Neon serverless)
- **Deployment**: Vercel (frontend), Node.js server (backend)

### 2.4 Design & Implementation Constraints
| Constraint | Rationale |
|------------|-----------|
| TypeScript throughout | Type safety, developer experience |
| Monorepo structure | Simplified dependency management, shared types |
| Stateless backend | Horizontal scalability |
| Serverless-compatible DB | Neon PostgreSQL for auto-scaling |
| Zod for validation | Runtime type safety, shared schemas |
| OpenAI Agents SDK | Agent lifecycle, tool use, handoffs |

### 2.5 Assumptions & Dependencies
- OpenAI API latency and availability meets SLAs
- Users have access to a modern web browser
- Generated code is reviewed before production use
- API keys are stored securely and rotated regularly

---

## 3. Functional Requirements

### 3.1 User Management (FR-UM)

#### FR-UM-01: User Registration
| Field | Specification |
|-------|---------------|
| **ID** | FR-UM-01 |
| **Description** | User registers with email and password or OAuth (Google, GitHub) |
| **Input** | Email, password, name |
| **Output** | JWT token, user profile |
| **Validation** | Email format, password >= 8 chars with complexity |
| **Error States** | Duplicate email, weak password, OAuth failure |

#### FR-UM-02: Authentication
| Field | Specification |
|-------|---------------|
| **ID** | FR-UM-02 |
| **Description** | User authenticates via JWT-based session |
| **Flow** | Login -> JWT access token (15min) + refresh token (7d) |
| **Endpoint** | POST /api/auth/login |

#### FR-UM-03: Team Management
| Field | Specification |
|-------|---------------|
| **ID** | FR-UM-03 |
| **Description** | Users can create and join teams with role-based permissions |
| **Roles** | Owner, Admin, Member, Viewer |

### 3.2 Project Management (FR-PM)

#### FR-PM-01: Create Project
| Field | Specification |
|-------|---------------|
| **ID** | FR-PM-01 |
| **Description** | User submits a natural language description of their software idea |
| **Input** | Text (100-5000 chars), optional tech stack preferences |
| **Output** | Project object with status `draft` |
| **Precondition** | User authenticated |
| **Postcondition** | Project created, CEO Agent triggered |

#### FR-PM-02: View Project
| Field | Specification |
|-------|---------------|
| **ID** | FR-PM-02 |
| **Description** | User views project details, including current status, agent outputs, and timeline |
| **Output Fields** | Title, description, status, current agent, agent outputs (historical), timestamps |

#### FR-PM-03: Project Approval Gate
| Field | Specification |
|-------|---------------|
| **ID** | FR-PM-03 |
| **Description** | User approves or rejects an agent's output before next agent begins |
| **Actions** | Approve, Reject with feedback, Request modification |
| **Postcondition (Approve)** | Pipeline advances to next agent |
| **Postcondition (Reject)** | Current agent re-executes with feedback |

#### FR-PM-04: Project History
| Field | Specification |
|-------|---------------|
| **ID** | FR-PM-04 |
| **Description** | User can browse, search, and filter past projects |
| **Filters** | Status, date range, search text |
| **Pagination** | 20 projects per page, cursor-based |

### 3.3 Agent Orchestration (FR-AO)

#### FR-AO-01: Agent Pipeline Execution
| Field | Specification |
|-------|---------------|
| **ID** | FR-AO-01 |
| **Description** | Orchestrator executes agents in defined sequence with parallel spawning where appropriate |
| **Lifecycle** | Pending -> Running -> AwaitingApproval -> Approved/Rejected -> Completed/Failed |
| **Parallel Support** | UI Designer, DB Engineer, Backend Engineer, Frontend Engineer run in parallel |

#### FR-AO-02: Agent Output Generation
| Field | Specification |
|-------|---------------|
| **ID** | FR-AO-02 |
| **Description** | Each agent produces structured output in its domain |
| **Output Format** | Markdown documents and/or code files per agent type |
| **Storage** | Files stored in project directory, metadata in database |

#### FR-AO-03: Real-time Status Streaming
| Field | Specification |
|-------|---------------|
| **ID** | FR-AO-03 |
| **Description** | Agent progress streamed to frontend via WebSocket |
| **Events** | agent:start, agent:thinking, agent:tool_use, agent:output, agent:complete, agent:error |
| **Update Frequency** | Real-time (sub-second for status changes) |

#### FR-AO-04: Feedback Loop
| Field | Specification |
|-------|---------------|
| **ID** | FR-AO-04 |
| **Description** | User provides feedback on agent output; agent re-executes incorporating feedback |
| **Max Iterations** | 3 per agent (configurable) |
| **Feedback Format** | Free text + optional structured checklist |

### 3.4 AI Agent Functions (FR-AI)

#### FR-AI-01: CEO Agent
| Responsibility | Output |
|----------------|--------|
| Interpret user's natural language description | Project charter |
| Define project scope and success criteria | Scope document |
| Ask clarifying questions | Structured Q&A |
| Decide tech stack (with user input) | Technology decisions document |

#### FR-AI-02: Product Manager Agent
| Responsibility | Output |
|----------------|--------|
| Analyse CEO output and infer full requirements | PRD (01-PRD.md) |
| Define user stories and acceptance criteria | User story map |
| Prioritise features (MoSCoW) | Prioritised backlog |
| Define non-functional requirements | NFR checklist |

#### FR-AI-03: Software Architect Agent
| Responsibility | Output |
|----------------|--------|
| Design system architecture | SRS, SDD, System Architecture |
| Define component boundaries | Component diagram specification |
| Select design patterns | Pattern decision log |
| Produce API/data/frontend specs | 04-10 architecture documents |

#### FR-AI-04: UI Designer Agent
| Responsibility | Output |
|----------------|--------|
| Design component tree | Component hierarchy |
| Generate Radix UI + shadcn/ui component spec | Component specification |
| Define layout and page structure | Page tree |
| Generate Tailwind CSS theme | Theme configuration |

#### FR-AI-05: Database Engineer Agent
| Responsibility | Output |
|----------------|--------|
| Design database schema | Drizzle schema files |
| Define indexes and constraints | Index specification |
| Generate migration files | Drizzle migration SQL |
| Create seed data scripts | Seed script files |

#### FR-AI-06: Backend Engineer Agent
| Responsibility | Output |
|----------------|--------|
| Implement Express.js MVC structure | Full backend code |
| Create routes, controllers, services | Layered backend files |
| Implement middleware (auth, validation, error handling) | Middleware stack |
| Implement API endpoints per API spec | Route handlers |

#### FR-AI-07: Frontend Engineer Agent
| Responsibility | Output |
|----------------|--------|
| Implement Next.js pages and layout | Page components |
| Create React components with Radix UI | Component library |
| Implement API client hooks | Data fetching layer |
| Wire up Tailwind CSS styling | Styled components |
| Implement client-side validation with Zod | Form validation |

#### FR-AI-08: QA Engineer Agent
| Responsibility | Output |
|----------------|--------|
| Generate test plan | Test strategy document |
| Create integration tests | Test suites |
| Generate E2E tests | Playwright/Cypress tests |
| Perform security review | Security audit report |

#### FR-AI-09: DevOps Engineer Agent
| Responsibility | Output |
|----------------|--------|
| Generate Docker configuration | Dockerfile, docker-compose |
| Create CI/CD pipeline config | GitHub Actions workflow |
| Set up environment variable templates | .env.example files |
| Configure Vercel deployment | vercel.json |

#### FR-AI-10: Documentation Engineer Agent
| Responsibility | Output |
|----------------|--------|
| Compile final README | README.md |
| Generate API documentation | OpenAPI/Swagger spec |
| Write deployment guide | DEPLOYMENT.md |
| Create developer onboarding guide | CONTRIBUTING.md |
| Final quality review across all outputs | QA checklist |

### 3.5 MCP Integration (FR-MCP)

#### FR-MCP-01: MCP Server
| Field | Specification |
|-------|---------------|
| **ID** | FR-MCP-01 |
| **Description** | An MCP-compliant server that exposes tools and resources to AI agents |
| **Protocol** | MCP specification (JSON-RPC) |
| **Transport** | HTTP/SSE and stdio |

#### FR-MCP-02: Context7 Documentation Lookup
| Field | Specification |
|-------|---------------|
| **ID** | FR-MCP-02 |
| **Description** | MCP tool that queries Context7 for up-to-date library documentation |
| **Input** | Library name, query text |
| **Output** | Structured documentation snippets |

#### FR-MCP-03: Repository Analysis
| Field | Specification |
|-------|---------------|
| **ID** | FR-MCP-03 |
| **Description** | MCP tools for reading, searching, and analysing the generated project repository |
| **Tools** | read_file, search_code, list_directory, get_file_tree |

### 3.6 File Generation (FR-FG)

#### FR-FG-01: Monorepo Scaffolding
| Field | Specification |
|-------|---------------|
| **ID** | FR-FG-01 |
| **Description** | Generate complete monorepo directory structure with package.json files |
| **Structure** | frontend/, backend/, docs/, shared/ |

#### FR-FG-02: Code File Generation
| Field | Specification |
|-------|---------------|
| **ID** | FR-FG-02 |
| **Description** | Write generated code files to disk in the project directory |
| **Format** | Properly formatted TypeScript/TSX per coding standards |

#### FR-FG-03: Documentation Generation
| Field | Specification |
|-------|---------------|
| **ID** | FR-FG-03 |
| **Description** | Generate all 13 specification documents in /docs |
| **Format** | GitHub-flavoured Markdown |

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-PF)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PF-01 | API response time (p95) | < 200ms for synchronous endpoints |
| NFR-PF-02 | Agent pipeline completion | < 10 minutes for standard project |
| NFR-PF-03 | Page load time (LCP) | < 1.5s |
| NFR-PF-04 | Concurrent project executions | Support 50 simultaneous pipelines |
| NFR-PF-05 | WebSocket message latency | < 100ms |

### 4.2 Security (NFR-SC)

| ID | Requirement | Specification |
|----|-------------|---------------|
| NFR-SC-01 | Data encryption at rest | AES-256 via Neon PostgreSQL |
| NFR-SC-02 | Data encryption in transit | TLS 1.3 |
| NFR-SC-03 | Authentication | JWT with RS256, refresh token rotation |
| NFR-SC-04 | Rate limiting | 100 req/min per user, 1000 req/min per IP |
| NFR-SC-05 | API key management | Environment variables + secrets manager |
| NFR-SC-06 | Input validation | Zod schemas on all endpoints |
| NFR-SC-07 | CORS | Whitelist allowed origins |
| NFR-SC-08 | SQL injection protection | Parameterised queries via Drizzle ORM |

### 4.3 Reliability (NFR-RL)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-RL-01 | Uptime | 99.9% |
| NFR-RL-02 | Backup frequency | Daily automated backups |
| NFR-RL-03 | Disaster recovery | RTO < 4 hours, RPO < 1 hour |
| NFR-RL-04 | Error rate | < 0.1% of API requests |

### 4.4 Scalability (NFR-SC)

| ID | Requirement | Approach |
|----|-------------|----------|
| NFR-SCAL-01 | Horizontal scaling | Stateless backend, multiple instances |
| NFR-SCAL-02 | Database scaling | Neon auto-scaling, connection pooling |
| NFR-SCAL-03 | Queue management | Bull/BullMQ for agent task queues |
| NFR-SCAL-04 | Caching | Redis for session cache and rate limiting |

### 4.5 Maintainability (NFR-MT)

| ID | Requirement | Specification |
|----|-------------|---------------|
| NFR-MT-01 | Code style | ESLint + Prettier, consistent config |
| NFR-MT-02 | Type coverage | 100% strict TypeScript, no `any` |
| NFR-MT-03 | Test coverage | > 80% unit test, > 60% integration |
| NFR-MT-04 | Documentation | All public APIs documented |
| NFR-MT-05 | Logging | Structured JSON logging |

### 4.6 Usability (NFR-US)

| ID | Requirement | Specification |
|----|-------------|---------------|
| NFR-US-01 | Responsive design | Mobile, tablet, desktop breakpoints |
| NFR-US-02 | Accessibility | WCAG 2.1 AA compliance |
| NFR-US-03 | Loading states | Skeleton loaders for all async content |
| NFR-US-04 | Error messages | User-friendly, actionable error messages |

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Web application built with Next.js 16
- Tailwind CSS for styling
- Radix UI / shadcn/ui for accessible components
- Real-time agent progress via WebSocket updates

### 5.2 Hardware Interfaces
- Standard cloud infrastructure (Vercel edge + Node.js servers)
- No direct hardware interface requirements

### 5.3 Software Interfaces
| Interface | Protocol | Data Format | Purpose |
|-----------|----------|-------------|---------|
| OpenAI API | HTTPS/REST | JSON | LLM inference for agents |
| Neon PostgreSQL | TCP/TLS | PostgreSQL wire | Primary database |
| Context7 API | HTTPS/MCP | JSON-RPC | Documentation lookup |
| GitHub API | HTTPS/REST | JSON | Repository management |
| Stripe API | HTTPS/REST | JSON | Payment processing |
| Vercel API | HTTPS/REST | JSON | Deployment |

### 5.4 Communication Interfaces
| Interface | Protocol | Purpose |
|-----------|----------|---------|
| WebSocket | WSS | Real-time agent streaming |
| REST API | HTTPS | CRUD operations |
| SSE | HTTP | Server-sent events for status updates |

---

## 6. System Features — Priority Matrix

| Feature | FR ID | Priority | Phase |
|---------|-------|----------|-------|
| Project creation | FR-PM-01 | P0 | 1 |
| CEO Agent | FR-AI-01 | P0 | 1 |
| PM Agent | FR-AI-02 | P0 | 1 |
| Architect Agent | FR-AI-03 | P0 | 1 |
| Approval gates | FR-PM-03 | P0 | 1 |
| Monorepo scaffolding | FR-FG-01 | P0 | 1 |
| API file generation | FR-FG-02 | P0 | 1 |
| Doc generation | FR-FG-03 | P0 | 1 |
| User auth | FR-UM-01/02 | P0 | 2 |
| Streaming | FR-AO-03 | P0 | 2 |
| Interface agents | FR-AI-04/05/06/07 | P0 | 3 |
| QA agent | FR-AI-08 | P0 | 3 |
| DevOps agent | FR-AI-09 | P1 | 3 |
| Doc agent | FR-AI-10 | P1 | 3 |
| MCP server | FR-MCP-01 | P0 | 4 |
| Context7 tool | FR-MCP-02 | P0 | 4 |
| Deployment pipeline | FR-FG-DEPLOY | P0 | 5 |
| Security scanning | FR-SEC | P1 | 5 |

---

## 7. Verification

| Requirement Type | Verification Method |
|-----------------|-------------------|
| Functional | Automated E2E tests, integration tests |
| Performance | k6 load testing, Lighthouse CI |
| Security | OWASP ZAP, SonarQube, npm audit |
| Accessibility | axe-core, Lighthouse a11y audit |
| Type safety | `tsc --strict` compilation |
| Code quality | ESLint, Prettier, depcheck |
