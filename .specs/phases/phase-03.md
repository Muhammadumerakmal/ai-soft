# Phase 3 — AI Software Company

## Objective
Implement all remaining engineering AI agents to complete the full agent pipeline: UI Designer, Database Engineer, Backend Engineer, Frontend Engineer, QA Engineer, DevOps Engineer, and Documentation Engineer.

## Scope
Agent implementation and code generation only. No infrastructure changes. The pipeline concludes with a complete, deployable software project.

## Internal Phases

| Internal Phase | Agent | Output |
|----------------|-------|--------|
| 3.1 UI Designer | Component hierarchy, Radix UI spec, Tailwind theme, page layout | Component tree + theme config |
| 3.2 DB Engineer | Drizzle schema, migrations, indexes, seed data | Schema `.ts` files + migration SQL |
| 3.3 Backend Engineer | Express.js MVC: routes, controllers, services, middleware | Complete `backend/` directory |
| 3.4 Frontend Engineer | Next.js pages, components, API client, TanStack Query hooks | Complete `frontend/` directory |
| 3.5 QA Engineer | Test plan, unit tests (Vitest), integration tests, E2E (Playwright) | Test suites + QA report |
| 3.6 DevOps Engineer | Dockerfile, docker-compose, GitHub Actions CI, Vercel config | Infra config files |
| 3.7 Documentation | README, DEPLOYMENT.md, CONTRIBUTING.md, API reference | Documentation suite |

## Execution Model

```
Architect output
  → [UI Designer | DB Engineer | Backend Engineer | Frontend Engineer]  (PARALLEL)
  → User approval gate (reject re-runs all four)
  → QA Agent (tests generated code)
  → User approval gate
  → DevOps Agent (configures deployment)
  → Documentation Agent (final docs)
  → User approval gate → Delivery
```

## Key Deliverables
- Ten fully implemented AI agents with system prompts
- Parallel execution stage for engineering agents
- Generated code that compiles and passes type checking
- Generated tests that pass against generated code
- Deployable Docker configuration and CI/CD pipeline
- Complete README and deployment documentation

## Agent Prompt Priorities

| Agent | Temperature | Max Tokens | Key Prompt Directive |
|-------|-------------|------------|---------------------|
| UI Designer | 0.4 | 6,000 | Radix UI composition, Tailwind theming, responsive design |
| DB Engineer | 0.2 | 8,000 | Drizzle ORM patterns, PostgreSQL optimisation, migration best practices |
| Backend Engineer | 0.2 | 16,000 | Express.js patterns, TypeScript, Zod validation, middleware stack |
| Frontend Engineer | 0.2 | 16,000 | Next.js App Router, RSC vs Client, shadcn/ui, TanStack Query |
| QA | 0.3 | 8,000 | Vitest, Playwright, security scanning |
| DevOps | 0.2 | 6,000 | Docker multi-stage, GitHub Actions, Vercel |
| Documentation | 0.3 | 8,000 | Concise technical writing, comprehensive coverage |

## Dependencies
- Phase 2 complete (frontend + streaming)
- OpenAI API access with sufficient quota

## Acceptance Criteria
- [ ] UI Designer generates valid Radix UI component specifications
- [ ] DB Engineer generates valid Drizzle schemas that compile with `tsc --strict`
- [ ] Backend Engineer generates Express.js code that starts without errors
- [ ] Frontend Engineer generates Next.js code that builds without errors (`next build`)
- [ ] QA agent generates tests that pass against generated code
- [ ] DevOps agent generates deployable Dockerfile + CI workflow
- [ ] Documentation agent produces complete, accurate README
- [ ] Full pipeline completes end-to-end (CEO → Documentation)
- [ ] Generated project is a functional monorepo

## Verification
```bash
# Create a project and let the full pipeline execute
# After completion:
cd /path/to/generated/project

# Verify backend
cd backend && npm install && npm run typecheck && npm run dev
curl http://localhost:3001/api/v1/health

# Verify frontend
cd frontend && npm install && npm run build

# Verify Docker
cd infra && docker-compose build

# Run generated tests
cd backend && npm test
cd frontend && npx playwright test
```
