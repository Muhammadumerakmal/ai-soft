# Deployment Guide

This guide walks through deploying AI Software Company to production: Vercel for both the
frontend and backend, Neon for Postgres, and Upstash for Redis. It assumes you already have
accounts with each provider — this repo does not create them for you.

## 1. Provision infrastructure

### Neon (Postgres)
1. Create a Neon project, then create a **production branch** separate from any dev branch.
2. Copy the pooled connection string — this is your `DATABASE_URL`. Keep `?sslmode=require` in
   the URL.
3. Apply the schema: from `backend/`, run `npx tsx src/db/migrate.ts` with `DATABASE_URL` set to
   the production connection string. This runs every file in `backend/src/db/migrations/`
   against the target database.
4. Seed the AI agent configs: `npx tsx src/db/seed.ts` (also against the production
   `DATABASE_URL`). This populates the `ai_agents` table with model/temperature/token-budget
   config for all 10 agents — the pipeline will not run without it.

### Upstash (Redis)
1. Create a Redis database (regional, not global, is fine for a queue workload).
2. Copy the `rediss://` connection string — this is your `REDIS_URL`. It's optional: without it
   the orchestrator falls back to executing agent steps inline instead of via BullMQ (see
   RUNBOOK.md), which works but doesn't scale past a single backend instance.

### OpenAI / OpenRouter
- `OPENAI_API_KEY` — any OpenAI-compatible API key.
- `OPENAI_BASE_URL` — leave blank for the real OpenAI API. Set to
  `https://openrouter.ai/api/v1` to route through OpenRouter instead (this repo has been tested
  against OpenRouter's `poolside/laguna-m.1:free` model — see `backend/src/db/seed.ts`).

### Stripe (optional — billing is disabled without it)
1. Create a Product with `pro` and `enterprise` prices in test or live mode.
2. `STRIPE_SECRET_KEY` — from the Stripe dashboard's API keys page.
3. `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE` — the price IDs from step 1.
4. `STRIPE_WEBHOOK_SECRET` — created in step 4 of the Vercel section below, once you have a
   public URL to register the webhook against.

## 2. Deploy the backend

The backend is a plain Express app (`backend/src/server.ts`) — deploy it anywhere that runs a
long-lived Node process (it holds a Socket.IO connection and, optionally, a BullMQ worker, so a
stateless serverless function is not a good fit). A small VM, Railway, Render, or Fly.io all
work. If you deploy it on Vercel anyway, note Vercel's serverless functions do not support
persistent WebSocket connections or the BullMQ worker — Socket.IO will fall back to HTTP
long-polling and REDIS_URL-backed queueing effectively won't run continuously.

1. Point the deploy at `backend/` with build command `npm run build` (from repo root:
   `npm run build --workspace=shared && npm run build --workspace=backend`) and start command
   `node backend/dist/server.js`. Alternatively, build and run `backend/Dockerfile` directly.
2. Set every environment variable listed in `backend/.env.example` on the host. At minimum:
   `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (set this
   to your deployed frontend's origin, not `localhost`).
3. Confirm it's up: `curl https://<your-backend-host>/api/v1/health/detailed` should report
   `"database": "healthy"` and `"openai": "healthy"`.
4. If using Stripe, register a webhook endpoint at
   `https://<your-backend-host>/api/v1/billing/webhook` for the events
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Stripe will give you a signing secret — set that as
   `STRIPE_WEBHOOK_SECRET` and redeploy.

## 3. Deploy the frontend (Vercel)

1. Import the repo into Vercel, set the project root to `frontend/`.
2. Build command: `cd .. && npm run build --workspace=shared && npm run build --workspace=frontend`
   (the frontend depends on the shared package's compiled output — see the root `README`/CI
   workflow for the exact sequence). Output directory: `.next` (Vercel's Next.js preset handles
   this automatically once the root is set correctly).
3. Set `NEXT_PUBLIC_API_URL` to your deployed backend's `/api/v1` URL
   (e.g. `https://api.yourdomain.com/api/v1`).
4. Custom domain: add it in Vercel's project settings, then update `CORS_ORIGIN` on the backend
   to match the final domain before going live.

## 4. Environment variable reference

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | yes | `production` in deployed environments |
| `PORT` | no (default 3001) | Backend HTTP port |
| `DATABASE_URL` | yes | Neon Postgres connection string |
| `OPENAI_API_KEY` | yes | OpenAI or OpenRouter API key |
| `OPENAI_BASE_URL` | no | Set to use an OpenAI-compatible provider other than OpenAI itself |
| `LOG_LEVEL` | no (default info) | pino log level |
| `CORS_ORIGIN` | yes | Must exactly match the deployed frontend's origin |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | yes | 32+ char random strings, must differ from each other |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | no | Token lifetimes (defaults `15m` / `7d`) |
| `REDIS_URL` | no | Enables BullMQ queueing; falls back to inline execution without it |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | no | Global API rate limit |
| `STRIPE_SECRET_KEY` | no | Enables billing checkout; endpoints 503 without it |
| `STRIPE_WEBHOOK_SECRET` | no | Required for the webhook endpoint to accept events |
| `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE` | no | Stripe Price IDs for paid plans |
| `MCP_PORT` | no (default 3002) | Port for the standalone MCP tool server (`npm run mcp`) |
| `MCP_API_KEY` | no | MCP server refuses all requests until this is set (fail-closed) |
| `CONTEXT7_API_KEY` / `CONTEXT7_BASE_URL` | no | Enables the MCP Context7 documentation tools |
| `NEXT_PUBLIC_API_URL` | yes (frontend) | Backend's public `/api/v1` base URL |

## 5. Post-deploy checklist

- [ ] `GET /api/v1/health/detailed` returns healthy database + openai
- [ ] Register a real account through the frontend, confirm login works
- [ ] Create a project, confirm the CEO agent produces output (check `docs/<projectId>/` for the
      generated charter once approved)
- [ ] If Stripe is configured, run a test checkout and confirm the webhook updates the
      subscription row
