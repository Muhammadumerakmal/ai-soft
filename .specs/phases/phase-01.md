# Phase 1 — Foundation & Architecture

## Objective
Build the core infrastructure: monorepo, database schema, authentication, project CRUD, and the orchestrator engine that drives the sequential agent pipeline (CEO → PM → Architect) with document generation and approval gates.

## Scope
All backend infrastructure required to take a natural language input and produce architecture documents. No frontend code. No parallel agents. No MCP.

## Phases Included

| Internal Phase | Deliverable |
|----------------|-------------|
| 1.1 Monorepo | Project scaffold, npm workspaces, shared configs |
| 1.2 Shared Package | Zod schemas, TypeScript types, constants |
| 1.3 Database | Drizzle schema, Neon setup, migrations, seed |
| 1.4 Backend Core | Express server, middleware stack, error handling |
| 1.5 Authentication | JWT auth: register, login, refresh, logout |
| 1.6 Project CRUD | Project endpoints with Zod validation |
| 1.7 Orchestrator | BullMQ queue, pipeline definition, agent executor |
| 1.8 CEO Agent | Natural language interpretation, project charter |
| 1.9 PM Agent | PRD generation with user stories |
| 1.10 Architect Agent | SRS, SDD, architecture document generation |
| 1.11 Approval Gates | Approve/reject endpoints, feedback loop |
| 1.12 Document Generation | Markdown file writing to `docs/` |

## Key Deliverables
- Working Express.js API on port 3001 with auth, project CRUD, and agent pipeline
- BullMQ queue processing CEO → PM → Architect agents sequentially
- Approval gates pausing and resuming pipeline
- Auto-generated PRD, SRS, SDD, and architecture documents in `docs/`
- Neon PostgreSQL database with all tables, migrations, and seed data

## Files Created
```
package.json, tsconfig.base.json, .eslintrc.cjs, .prettierrc, .gitignore
shared/src/schemas/   (auth, project, agent, team, deployment, billing)
shared/src/types/     (project, agent, user, team, deployment)
shared/src/constants/ (agents, status, errors)
backend/src/config/   (env, database, redis, cors, openai, jwt)
backend/src/middleware/ (auth, validate, rate-limit, error-handler, logging)
backend/src/routes/   (auth, user, project, agent, health)
backend/src/controllers/ (auth, user, project, agent)
backend/src/services/ (auth, user, project, agent, orchestrator, token)
backend/src/orchestrator/ (pipeline, agent-executor, context-builder, approval-gate, feedback-loop)
backend/src/agents/   (ceo, pm, architect + prompts/)
backend/src/db/schema/ (all 9 tables + enums)
backend/src/db/migrations/ (initial migration)
backend/drizzle.config.ts
```

## Dependencies
- Node.js 20+ LTS
- Neon PostgreSQL account
- Upstash Redis account
- OpenAI API key

## Acceptance Criteria
- [ ] `npm install` from root completes
- [ ] Drizzle migrations apply successfully to Neon
- [ ] `POST /auth/register` creates user, returns JWT
- [ ] `POST /auth/login` authenticates and returns tokens
- [ ] `POST /projects` creates project with status `draft`
- [ ] CEO agent produces structured project charter
- [ ] PM agent produces structured PRD
- [ ] Architect agent produces architecture documents
- [ ] Approval gate pauses pipeline after each agent
- [ ] Approve advances pipeline; reject re-executes with feedback
- [ ] Generated documents appear in `docs/` directory

## Verification
```bash
# Start backend
cd backend && npm run dev

# Test health
curl http://localhost:3001/api/v1/health

# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'

# Create project (use token from register response)
curl -X POST http://localhost:3001/api/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My App","description":"...","techStack":["next.js","express"]}'

# Check project status
curl http://localhost:3001/api/v1/projects/<id> \
  -H "Authorization: Bearer <token>"

# Approve agent output (when status is 'awaiting_approval')
curl -X POST http://localhost:3001/api/v1/projects/<id>/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Looks good"}'
```
