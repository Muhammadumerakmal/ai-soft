# Roadmap — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | RM-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Development Phases Overview

```
Phase 1         Phase 2          Phase 3           Phase 4           Phase 5
Foundation      SaaS Platform    AI Software       MCP Integration   Production
& Architecture                   Company                            & Deployment
─────────       ──────────       ──────────        ──────────        ──────────
Weeks 1-6       Weeks 7-10       Weeks 11-18       Weeks 19-22       Weeks 23-26
```

**Total Duration**: ~26 weeks (6 months)

---

## 2. Phase 1 — Foundation & Architecture (Weeks 1-6)

### Objective
Build the core infrastructure: monorepo, database, basic API, and the ability to take a natural language input and produce architecture documents.

### Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| **1** | Project scaffold | Monorepo setup, npm workspaces, shared package, ESLint + Prettier config, CI pipeline |
| **2** | Database foundation | Drizzle schema definitions, Neon DB setup, migration pipeline, seed scripts |
| **3** | API foundation | Express.js server, middleware stack, auth (register/login/JWT), project CRUD |
| **4** | Orchestrator MVP | BullMQ queue, CEO agent (prompt + execution), Project status management |
| **5** | Agent pipeline (sequential) | PM agent, Architect agent, Agent output storage, Context accumulation |
| **6** | Approval gates + docs | Approval endpoint, rejection + feedback loop, auto-generation of PRD/SRS/SDD docs |

### Key Decisions to Finalise
- OpenAI API key provisioning and budget
- Neon database URL and branch strategy
- Redis connection (Upstash or self-hosted)
- Domain names for staging environment

### Phase 1 Go/No-Go Criteria
- [ ] User can register and authenticate
- [ ] User creates project from natural language
- [ ] CEO, PM, and Architect agents produce valid documents
- [ ] Documents are generated in `/docs` directory of project
- [ ] Approval gate pauses and resumes pipeline
- [ ] Monorepo structure works with `npm install` from root

---

## 3. Phase 2 — SaaS Platform (Weeks 7-10)

### Objective
Add user management, team collaboration, dashboard, real-time streaming, and billing.

### Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| **7** | User dashboard | Next.js dashboard layout, project list with search/filter, responsive design |
| **8** | Real-time streaming | WebSocket gateway, Socket.IO integration, agent progress UI, live agent output viewer |
| **9** | Team management | Team CRUD, membership management, role-based access control on projects |
| **10** | Billing (MVP) | Stripe integration, subscription tiers, usage tracking, webhook handling |

### Key Decisions to Finalise
- Pricing tiers (free/pro/enterprise)
- Stripe product IDs
- WebSocket scaling strategy (Redis adapter)

### Phase 2 Go/No-Go Criteria
- [ ] Dashboard loads user's projects with SEO-friendly URLs
- [ ] Real-time agent progress visible in browser
- [ ] Team creation and member invitation works
- [ ] Stripe checkout flow completed end-to-end
- [ ] Team-based project access enforced

---

## 4. Phase 3 — AI Software Company (Weeks 11-18)

### Objective
Implement all remaining AI agents to complete the full agent pipeline, from UI design through to documentation.

### Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| **11** | UI Designer agent | Radix UI/shadcn component tree generation, Tailwind theme, page layout spec |
| **12** | DB Engineer agent | Drizzle schema generation, migration files, seed scripts, index definitions |
| **13-14** | Backend Engineer agent | Full Express.js MVC code generation with routes, controllers, services, middleware, Zod validation |
| **15-16** | Frontend Engineer agent | Full Next.js code generation with pages, components, API client, TanStack Query hooks |
| **17** | QA agent | Test plan generation, Vitest test files, Playwright E2E tests, security review |
| **18** | DevOps + Documentation agents | Dockerfile, CI workflow, Vercel config, README, deployment guide, API reference |

### Key Decisions to Finalise
- Code generation quality benchmarks
- Fallback models for agent failures
- File generation concurrency limits

### Phase 3 Go/No-Go Criteria
- [ ] UI Designer generates valid component specifications
- [ ] DB Engineer generates valid Drizzle schemas that compile
- [ ] Backend Engineer generates Express.js code that starts without errors
- [ ] Frontend Engineer generates Next.js code that builds without errors
- [ ] QA agent generates tests that pass on generated code
- [ ] DevOps agent generates deployable configuration
- [ ] Documentation agent produces comprehensive README

---

## 5. Phase 4 — MCP Integration (Weeks 19-22)

### Objective
Build and integrate the MCP server for tool-augmented agent reasoning, Context7 documentation lookup, and advanced capabilities.

### Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| **19** | MCP server core | MCP protocol implementation, JSON-RPC handling, HTTP/SSE transport, tool registry |
| **20** | MCP tools (File + Shell) | File system tools (read/write/search), sandboxed shell execution, path traversal protection |
| **21** | MCP tools (Context7) | Context7 `resolve_library_id` and `query_docs` tools, response caching, error handling |
| **22** | MCP integration with agents | Replace direct tool calls with MCP, agent performance comparison, optimisations |

### Key Decisions to Finalise
- MCP server deployment model (sidecar vs embedded)
- Context7 API key and usage limits
- Caching strategy for documentation lookups

### Phase 4 Go/No-Go Criteria
- [ ] MCP server starts and responds to JSON-RPC requests
- [ ] File system tools can read/write within project directory
- [ ] Context7 tools return accurate documentation
- [ ] Agents successfully use MCP tools in their execution
- [ ] Shell execution tools work with whitelisted commands
- [ ] MCP security controls prevent path traversal and command injection

---

## 6. Phase 5 — Production & Deployment (Weeks 23-26)

### Objective
Harden the platform for production: performance optimisation, security auditing, monitoring, and go-live.

### Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| **23** | Performance optimisation | LLM token optimisation, response caching, database query optimisation, bundle size reduction |
| **24** | Security hardening | OWASP audit, SAST integration, penetration testing, secrets scanning, dependency audit |
| **25** | Production infrastructure | Vercel production deployment, Neon production branch, monitoring setup (Sentry, Logtail), alerting |
| **26** | Launch prep | Load testing (k6), documentation freeze, onboarding docs, marketing page, launch checklist |

### Key Decisions to Finalise
- Production environment variables and secrets
- Monitoring and alerting thresholds
- Support and incident response plan
- SLA commitments

### Phase 5 Go/No-Go Criteria
- [ ] Load test passes (100 concurrent users, < 2s response time)
- [ ] Security audit shows zero critical/high findings
- [ ] All API endpoints respond within SLOs
- [ ] Monitoring and alerting configured and tested
- [ ] Vercel deployment pipeline works end-to-end
- [ ] Disaster recovery plan documented
- [ ] Onboarding documentation complete

---

## 7. Timeline Summary

```
Phase 1: ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  Weeks 1-6
Phase 2: ░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░  Weeks 7-10
Phase 3: ░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░  Weeks 11-18
Phase 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░░░░░░░  Weeks 19-22
Phase 5: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████  Weeks 23-26
```

---

## 8. Resource Allocation

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| Full-Stack Engineer | 2 FTE | 2 FTE | 3 FTE | 2 FTE | 2 FTE |
| AI/ML Engineer | 1 FTE | 0.5 FTE | 1 FTE | 1 FTE | 0.5 FTE |
| DevOps Engineer | 0.5 FTE | 0.5 FTE | 0.5 FTE | 0.5 FTE | 1 FTE |
| UI/UX Designer | 0.5 FTE | 1 FTE | 0.5 FTE | 0 FTE | 0.5 FTE |
| Product Manager | 0.5 FTE | 0.5 FTE | 0.5 FTE | 0.25 FTE | 0.25 FTE |

**FTE = Full-Time Equivalent**

---

## 9. Risks & Contingency

| Risk | Phase | Likelihood | Impact | Mitigation |
|------|-------|------------|--------|------------|
| OpenAI API downtime | All | Low | Critical | Queue retries, fallback models |
| Agent output quality below threshold | 3 | Medium | High | Iterative feedback, prompt tuning, human review |
| Token costs exceed budget | 3+ | Medium | Medium | Token budgeting, caching, cheaper models for simple agents |
| Neon database scaling issues | 5 | Low | Medium | Connection pooling, read replicas |
| WebSocket connection limits | 2 | Low | Medium | Horizontal scaling with Redis adapter |
| Scope creep | All | Medium | High | Strict phase gating, PRD-driven development |

### Contingency Buffer
- 2 weeks buffer built into each phase for unexpected issues
- Phase gating ensures no carry-over of incomplete work
- Critical path items identified and monitored weekly

---

## 10. Post-Launch Roadmap

### Q2 2027 — Platform Maturity
- Multi-model support (Claude, Gemini, local models)
- Custom agent creation by users
- Advanced collaboration features (comments, annotations)
- API for third-party integrations

### Q3 2027 — Enterprise
- SSO/SAML authentication
- Audit logging and compliance reports
- Private cloud deployment option
- Dedicated agent fine-tuning per organisation

### Q4 2027 — Ecosystem
- Plugin marketplace for custom agents and tools
- Community templates and starter kits
- VS Code extension for local integration
- Mobile app for project monitoring

---

## 11. Dependency Map

```
Phase 1 ──────► Phase 2 ──────► Phase 3 ──────► Phase 4 ──────► Phase 5
  │                │                │                │                │
  ├─ Monorepo      ├─ Dashboard     ├─ UI Agent      ├─ MCP Core      ├─ Performance
  ├─ Database      ├─ WebSocket     ├─ DB Agent      ├─ File Tools    ├─ Security
  ├─ Auth          ├─ Teams         ├─ BE Agent      ├─ Context7      ├─ Monitoring
  ├─ CEO Agent     ├─ Billing       ├─ FE Agent      ├─ Integration   ├─ Load Test
  ├─ PM Agent      │                ├─ QA Agent      │                ├─ Launch
  ├─ Architect     │                ├─ DevOps        │
  └─ Approval      │                └─ Docs          │
     └─────────────┘                └────────────────┘
```

**Note**: Each phase depends on the completion of all previous phases. No parallel phase execution.
