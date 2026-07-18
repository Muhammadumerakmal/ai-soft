# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository.

## What this is

**AI Software Company** — a SaaS platform that turns a natural-language product idea into
production-grade software by orchestrating a pipeline of specialised AI agents (CEO → PM →
Architect → engineering team → QA → DevOps → Docs). Users describe an idea, approve each
stage, and receive a full monorepo with docs.

This repository is itself a TypeScript monorepo built to those same standards.

## Monorepo layout

npm workspaces, three packages with a strict dependency direction: `shared ← backend ← frontend`.

| Workspace | Path | Stack | Purpose |
|-----------|------|-------|---------|
| `@aisoftco/shared` | `shared/` | TypeScript + Zod | Source-of-truth Zod schemas, derived types, constants. **No app logic.** |
| `@aisoftco/backend` | `backend/` | Express 4, Drizzle ORM, Neon Postgres, BullMQ/Redis, Socket.IO, OpenAI | REST API, agent orchestrator, MCP server |
| `@aisoftco/frontend` | `frontend/` | Next.js 15 (App Router), React 19, Tailwind, shadcn/ui, TanStack Query | Web app |

`shared` must be built before backend/frontend typecheck cleanly — the root `build` script
handles ordering. `frontend` and `backend` may only import from `shared`'s public surface.

## Commands

Run from the repo root unless noted. On Windows the default shell is PowerShell; a Bash tool
is also available.

```bash
npm run build          # builds shared → backend → frontend (in order)
npm run typecheck      # tsc --noEmit across all three workspaces
npm run lint           # eslint (shared, backend) + next lint (frontend)
npm run format         # prettier --write
npm run format:check   # prettier --check

npm run dev            # runs backend + frontend dev servers concurrently
```

Per-workspace (use `--workspace=<name>`), e.g.:

```bash
npm run dev --workspace=backend      # tsx watch src/server.ts
npm run mcp --workspace=backend      # tsx watch src/mcp/index.ts (standalone MCP server)
npm run dev --workspace=frontend     # next dev

npm run db:generate --workspace=backend   # drizzle-kit generate (create migration)
npm run db:migrate  --workspace=backend   # drizzle-kit push
npm run db:studio   --workspace=backend   # drizzle-kit studio
npm run db:seed     --workspace=backend   # tsx src/db/seed.ts
```

There is no test runner wired up yet; "verify" means `npm run typecheck && npm run lint && npm run build`.

## Backend architecture

Strict MVC + service layer. Never break these layer boundaries:

```
route → controller → service → db (Drizzle)
         (HTTP only)  (business logic,   (data access,
                        no req/res)        no business logic)
```

- **Controllers** (`src/controllers/`): parse `req`, delegate to a service, send `res`, and
  forward errors with `next(error)`. No business logic, no DB access, no conditionals.
- **Services** (`src/services/`): all business logic. No HTTP awareness. Throw the custom
  error classes from `src/utils/errors.ts` (`AppError` subclasses map to status codes).
- **Middleware** (`src/middleware/`): auth (JWT), Zod `validate`, rate limiting, request-id,
  request-logger, error-handler. Stack order matters — see `src/app.ts`.
- **Config** (`src/config/index.ts`): env is validated once through a Zod schema; import
  `env` from there, never read `process.env` directly elsewhere.

### API surface

Everything is mounted under `/api/v1` (see `src/app.ts`): `health`, `auth`, `projects`,
`users`, `teams`, `billing`. The Stripe webhook (`/api/v1/billing/webhook`) is registered
**before** the JSON body parser because it needs the raw body for signature verification —
keep it there.

Responses use the envelope `{ success, data, meta? }` / `{ success, error: { code, message, details? } }`.

### AI agent pipeline

- `src/orchestrator/` drives execution; `src/agents/` holds agent definitions and prompts.
- Pipeline order lives in `src/agents/index.ts` (`PIPELINE_STAGES`). Stage 4 (ui_designer,
  db_engineer, backend_engineer, frontend_engineer) runs concurrently; everything else is
  sequential: `ceo → pm → architect → [engineering] → qa → devops → documentation`.
- Add a new agent by creating `*.agent.ts` + `prompts/*.prompt.ts` and registering it in
  `AGENT_REGISTRY` / `PIPELINE_STAGES`. Do **not** add switch statements in the executor.
- Every agent output is validated against a Zod schema before it is stored; invalid output
  triggers a retry with a stricter prompt.
- Steps are enqueued to BullMQ when `REDIS_URL` is set; otherwise they execute **inline**
  (see `src/orchestrator/pipeline.ts`) — so the pipeline works locally without Redis.

### MCP server

`src/mcp/` is a standalone Express app on its own port (`MCP_PORT`, default 3002). It
**fails closed** — returns 503 on every request unless `MCP_API_KEY` is set — so `server.ts`
always starts it alongside the main API. Tools live in `src/mcp/tools/` (filesystem, shell,
code-analysis, context7).

### Database

Drizzle ORM against Neon Postgres. Schema is split per-table under `src/db/schema/`,
migrations under `src/db/migrations/`. Rules: no raw SQL, no `SELECT *`, use `.returning()`
on mutations, soft-delete via `deletedAt` (queries filter `isNull(deletedAt)`), every table
has `id`/`createdAt`/`updatedAt`/`deletedAt`. Migrations are immutable once committed.

## Frontend architecture

Next.js App Router under `frontend/src/app/`. Route groups: `(app)` for authenticated pages
(dashboard, projects, teams, settings/billing), plus `login`/`register`. `src/middleware.ts`
guards auth.

- **Server Components by default**; add `'use client'` only for interactivity/hooks/browser APIs.
- **Server state** via TanStack Query hooks in `src/hooks/`; the API client is `src/lib/api-client.ts`.
- **Real-time** agent progress via Socket.IO (`src/lib/socket.ts`, `use-agent-stream` hook).
- **Auth** via React context + JWT in `src/providers/auth-provider.tsx`.
- **UI** is shadcn/ui primitives in `src/components/ui/` — extend these, don't add other
  component libraries. Style with Tailwind + the `cn()` helper only; no ad-hoc CSS files.
- **Forms** use React Hook Form + `zodResolver`, reusing schemas from `@aisoftco/shared`.

## Conventions (enforced)

Full detail in `docs/11-Coding-Standards.md` and `.specs/rules/`. The high-frequency rules:

- **Validation lives in `shared/`.** A Zod schema is the single source of truth; frontend and
  backend both import it. Don't duplicate a shape.
- **No `any`** — use `unknown` + narrowing. Prefer `type` + `as const` unions over `enum`.
- **Named exports** everywhere except Next.js `page.tsx`/`layout.tsx` (default export).
- **No `console.log`** in backend runtime code — use the Pino `logger` from `src/utils/logger.ts`
  with a correlation id. (The one deliberate exception is `src/config/index.ts`, which runs
  before the logger exists; it carries an eslint-disable.)
- **Files/dirs kebab-case**; components PascalCase; DB tables/columns snake_case.
- Imports are grouped node builtins → third-party → `@/` internal → relative, with type-only
  imports separated. ESLint import-order enforces this.
- Keep cyclomatic complexity ≤ 10 and functions ≤ ~30 lines (ESLint `complexity`/`max-params`
  warn, not error — but don't add new violations).

## Environment

Copy `.env.example` to `.env` (backend) / `.env.local` (frontend). Backend boots even without
`REDIS_URL` (inline pipeline) and without Stripe/Context7 keys (those features degrade
gracefully). `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are
required — the config Zod schema exits the process if they're missing/invalid.

`OPENAI_BASE_URL` can point the OpenAI client at an OpenAI-compatible gateway (e.g. OpenRouter).

## Where to find things

- Product/architecture specs: `.specs/product/`, `.specs/architecture/`
- Per-domain rules: `.specs/rules/{ai,backend,frontend,database,coding}.md`
- Phase plans: `.specs/phases/phase-0{1..5}.md`
- Engineering standards handbook: `docs/11-Coding-Standards.md`
- Deployment & ops: `DEPLOYMENT.md`, `RUNBOOK.md`, `LAUNCH_CHECKLIST.md`, `docker-compose.yml`
- Repo-specific sub-agents for Claude Code: `.claude/agents/`

## Working agreements for agents

- Before finishing a change, run `npm run typecheck` (and `npm run lint` if you touched more
  than a line or two). The tree currently builds clean with zero errors — keep it that way.
- Respect the layer boundaries above; most "quick fixes" that reach across them are the wrong fix.
- Prefer editing an existing pattern over introducing a new abstraction (YAGNI — see standards §2.4).
- Don't commit or push unless asked.
