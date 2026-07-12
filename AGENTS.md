# AGENTS.md

Monorepo for AI Software Company — a SaaS where AI agents collaborate to build software.

## Workspace

npm workspaces in `/frontend` (Next.js 15), `/backend` (Fastify), `/docs`.

## Commands

| Command                | What                                  |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | All workspaces in parallel            |
| `npm run dev:frontend` | Next.js dev server (port 3000)        |
| `npm run dev:backend`  | Fastify via `tsx watch` (port 4000)   |
| `npm run build`        | Build all workspaces                  |
| `npm run typecheck`    | `tsc --noEmit` for frontend + backend |
| `npm run lint`         | ESLint on both                        |

Run for a single workspace: `npm run <script> -w <workspace>` or `npm run <script> --workspace=<workspace>` (e.g. `npm run dev -w backend`).

## Stack

- **Frontend**: Next.js 15 (App Router, src/), React 19, Tailwind CSS v3, shadcn/ui, TanStack Query, React Hook Form + Zod, Lucide, Sonner
- **Backend**: Fastify 5, Drizzle ORM + Neon PostgreSQL, Zod, OpenAI Agents SDK (`@openai/agents`), JWT (HTTP-only cookies)
- **Monorepo**: npm workspaces
- **Dev**: `tsx watch` for backend (no compile step), `next dev` for frontend

## Architecture

- Feature-based modules under `backend/src/modules/<name>/` with their own routes
- Frontend feature code under `frontend/src/features/<name>/`
- Shared utilities: `frontend/src/lib/utils.ts` (cn helper), `backend/src/shared/`
- DB schema in `backend/src/db/schema/`, migrations in `backend/drizzle/`
- Env validation via Zod at backend startup (`backend/src/config/env.ts`)
- AI module (`backend/src/modules/ai/`) uses `Agent` + `run` from `@openai/agents`

## Environment (Context7)

Set this in your PowerShell session before starting OpenCode to enable live docs lookups:

```powershell
$env:CONTEXT7_API_KEY = "ctx7sk-85a70da4-6b6d-4f23-a2c9-316b9da0fe31"
```

## Config files

Each workspace has `.env.example`. Copy to `.env` before running:

- Backend requires `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`
- Frontend needs `NEXT_PUBLIC_API_URL` pointing at backend

## Build order

`typecheck` before `build` if making structural changes. Both succeed currently.

## Gotchas

- Backend is ESM (`"type": "module"` in package.json). Imports use `.js` extensions (resolved by tsx).
- No test framework configured yet — need to add one before writing tests.
- `rimraf` is available in each workspace for `npm run clean`.
- Husky auto-installs via `prepare` script on `npm install`.
- lint-staged runs ESLint + Prettier on staged files before commit.
- Zod v4 is used (not v3) — `.errors` is `.issues`, `.nonempty()` is `.min(1)`.
- `@openai/agents` requires Zod v4 and `openai` v6+.
