# Engineering Roadmap

## Overview

27 implementation phases across five natural stage gates. Each phase has a single responsibility, is independently testable, and produces a working application.

## Stage Gates

```
Gate 1: Foundation     ── Phases 1-7  ── CLI-tested backend with auth
Gate 2: Core Pipeline  ── Phases 8-12 ── End-to-end spec generation
Gate 3: Frontend       ── Phases 13-16 ── Full UI with real-time streaming
Gate 4: Engineering    ── Phases 17-22 ── Complete code generation
Gate 5: Production     ── Phases 23-27 ── Multi-tenant SaaS deployed
```

## Phase Summary

| # | Phase | Stage | Est. Effort | Key Deliverable |
|---|-------|-------|-------------|-----------------|
| 1 | Monorepo Foundation | Foundation | 2d | Repository structure |
| 2 | Shared Package | Foundation | 3d | Zod schemas + types |
| 3 | Database Foundation | Foundation | 3d | Drizzle schema + migrations |
| 4 | Backend Core | Foundation | 3d | Express server + middleware |
| 5 | Authentication | Foundation | 4d | JWT auth endpoints |
| 6 | Project CRUD | Foundation | 3d | Project REST API |
| 7 | Orchestrator Foundation | Foundation | 4d | BullMQ + pipeline engine |
| 8 | CEO Agent | Core Pipeline | 3d | CEO agent |
| 9 | PM Agent | Core Pipeline | 3d | PM agent |
| 10 | Architect Agent | Core Pipeline | 4d | Architect agent |
| 11 | Approval Gates | Core Pipeline | 3d | Approve/reject API |
| 12 | Document Generation | Core Pipeline | 3d | Markdown file output |
| 13 | Next.js Frontend | Frontend | 3d | Next.js app + shadcn/ui |
| 14 | Auth & Dashboard | Frontend | 4d | Login + dashboard UI |
| 15 | Project View | Frontend | 4d | Project detail + approval UI |
| 16 | Real-Time Streaming | Frontend | 4d | WebSocket + live agent UI |
| 17 | UI Designer Agent | Engineering | 4d | UI component spec |
| 18 | DB Engineer Agent | Engineering | 4d | Drizzle schema generation |
| 19 | Backend Engineer Agent | Engineering | 6d | Express.js code generation |
| 20 | Frontend Engineer Agent | Engineering | 6d | Next.js code generation |
| 21 | QA Agent | Engineering | 4d | Test suite generation |
| 22 | DevOps & Docs Agents | Engineering | 4d | Config + documentation |
| 23 | Team Management & Billing | Platform | 5d | Multi-tenant + Stripe |
| 24 | MCP Server & Tools | Production | 5d | MCP protocol + tools |
| 25 | MCP-Agent Integration | Production | 3d | MCP tool integration |
| 26 | Performance & Security | Production | 5d | Optimisation + audit |
| 27 | Production Launch | Production | 5d | Live deployment |

**Total: ~100 working days (~20w for 2-3 engineers)**

## Key Milestones

| Milestone | Phase | Deliverable |
|-----------|-------|-------------|
| Backend operational | 4 | Express server with health endpoint |
| Auth working | 5 | Login/register/token refresh |
| Project CRUD | 6 | Create, list, get, delete projects |
| Orchestrator running | 7 | BullMQ queue processing agent jobs |
| CEO Agent produces output | 8 | Project charter generated |
| End-to-end spec pipeline | 12 | CEO→PM→Architect→Docs→Approval |
| Frontend operational | 13 | Next.js app with providers |
| Dashboard live | 14 | Login → dashboard → create project |
| Real-time streaming | 16 | Live agent progress visible in browser |
| Engineering agents complete | 22 | All 10 agents produce valid output |
| Multi-tenant with billing | 23 | Teams + Stripe subscriptions |
| MCP server operational | 24 | MCP tools callable |
| MCP-agent integration | 25 | All agents use MCP tools |
| Performance & security | 26 | All targets met |
| Production launch | 27 | Platform live on production |

## Dependency Graph

```
Phase 1  → Phase 2  → Phase 3  → Phase 4  → Phase 5  → Phase 6
                                                              ↓
Phase 12 ← Phase 11 ← Phase 10 ← Phase 9  ← Phase 8  ← Phase 7
                                                              ↓
Phase 13 → Phase 14 → Phase 15 → Phase 16
                                      ↓
Phase 18 ← Phase 17                   ↓
    ↓         ↓                       ↓
Phase 19 → Phase 20 → Phase 21 → Phase 22
    ↓                     ↓             ↓
    └─────────────────────┴─────────────┘
                    ↓
Phase 23 (independent, can run concurrently with 17-22)
                    ↓
Phase 24 → Phase 25 → Phase 26 → Phase 27
```

## Phase Structure

Every phase includes:
1. **Objective** — Single sentence
2. **Scope** — What is included and explicitly excluded
3. **Features** — Numbered feature list
4. **Deliverables** — Concrete artifacts
5. **Files/Folders** — Every file created or modified
6. **Dependencies** — Required prior phases
7. **Acceptance Criteria** — Pass/fail conditions
8. **Testing Checklist** — Specific tests
9. **Definition of Done** — Completion conditions
10. **Risks** — Technical or process risks
11. **Future Considerations** — Notes for later phases

## Risk Registry

| Risk | Phase(s) | Impact | Likelihood | Mitigation |
|------|----------|--------|------------|------------|
| OpenAI API outage | 8-22 | Critical | Low | BullMQ retry, fallback model |
| LLM output quality low | 8-12 | High | Medium | Approval gates, feedback loops |
| Agent cost overruns | 8-22 | Medium | Medium | Token budgeting, caching |
| Neon DB scaling | All | Medium | Low | Connection pooling, monitoring |
| WebSocket limits | 16 | Medium | Low | Redis adapter, horizontal scaling |
| MCP latency | 24-25 | Medium | Medium | Connection pooling, caching |
| Vercel cold starts | 27 | Low | Medium | Function warm-up, edge functions |
| Prompt injection | 8-22 | Critical | Low | Input sanitisation, output validation |
