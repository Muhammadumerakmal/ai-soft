# Incident Response Runbook

## Checking system health

`GET /api/v1/health` — liveness only, always returns `200 { status: "ok" }` if the process is
running. Use this for a load balancer/uptime check.

`GET /api/v1/health/detailed` — checks database, OpenAI, and Redis connectivity and reports each
independently:

```json
{
  "status": "ok",
  "details": {
    "database": { "status": "healthy", "latency": 42 },
    "openai": { "status": "healthy", "latency": 0 },
    "redis": { "status": "skipped", "error": "REDIS_URL not configured" }
  }
}
```

`GET /api/v1/health/ready` — same checks, but returns HTTP 503 instead of 200 if the database or
OpenAI check fails (`redis: "skipped"` does not count as unhealthy). Use this for a
readiness probe, not liveness.

## Reading logs

The backend logs structured JSON via pino. Every request is tagged with a `reqId` (set by
`backend/src/middleware/request-id.ts`, either forwarded from an incoming `X-Request-Id` header
or generated fresh) — grep logs by `reqId` to follow one request end-to-end, including into any
`ERROR` lines it triggered. `backend/src/middleware/request-logger.ts` emits a `Request
completed` line for every request with `method`, `url`, `statusCode`, and `duration`.

## Rolling back a bad deploy

There is no automated rollback configured (no blue/green or canary setup in this repo). To roll
back:

1. `git revert <bad-commit-or-merge>` on `main` (don't `reset --hard` a shared branch).
2. Push — CI runs, and your hosting provider's normal deploy-on-push behavior redeploys the
   reverted code.
3. If the bad deploy included a database migration, do **not** auto-revert the migration —
   schema changes are rarely safely reversible. Assess whether the migration itself is the
   problem before touching the database; most rollbacks only need to revert application code.

## Known failure modes and how this codebase actually handles them

These are the graceful-degradation behaviors already built into the code — read the referenced
source before assuming a service is "down" just because a feature is degraded.

**Database unreachable** (`backend/src/config/database.ts`, `backend/src/services/health.service.ts`)
The `/health/detailed` database check reports `"unhealthy"` with the Neon driver's error message.
Every request that touches the DB will 500. There is no fallback — this is a hard dependency.
Check Neon's status page and that `DATABASE_URL` hasn't rotated.

**Redis down or `REDIS_URL` unset** (`backend/src/config/redis.ts`, `backend/src/orchestrator/pipeline.ts`)
Not a hard failure. `config/redis.ts` logs a warning and exports `redis = null` instead of
crashing. The orchestrator (`pipeline.ts`'s `enqueueStep`) checks for a live BullMQ connection
and, if unavailable, executes the agent step **inline and synchronously** instead of queueing it.
The pipeline still completes — it just loses horizontal scalability and the ability to survive a
backend process restart mid-step.

**OpenAI / OpenRouter erroring or rate-limited** (`backend/src/orchestrator/agent-executor.ts`)
The specific workflow step is marked `failed` with the provider's error message attached, the
workflow and project are both marked `failed`, and the frontend surfaces this via the project
detail page. There is no automatic retry beyond the existing human-driven reject → feedback →
re-execute loop (capped at 3 iterations per step, see `MAX_FEEDBACK_ITERATIONS` in
`backend/src/orchestrator/index.ts`) — a provider outage requires a human to notice and either
wait or start a new project once the provider recovers.

**Stripe not configured** (`backend/src/services/billing.service.ts`)
`STRIPE_SECRET_KEY` unset means `config/stripe.ts` exports `stripe = null`. Every billing
endpoint that needs Stripe (`createCheckoutSession`, `handleWebhook`) throws a `503
BILLING_UNAVAILABLE` immediately rather than crashing. `GET /billing/subscription` still works
and auto-provisions a `free` plan row — only checkout is blocked. The rest of the app is
unaffected.

**MCP server unreachable** (`backend/src/mcp/`)
The MCP server is a fully separate process (`npm run mcp`, its own port). It is not yet called by
the main orchestrator (see the `TODO(integration)` comment in `backend/src/mcp/client.ts`), so as
of this writing its availability has no effect on the main API or agent pipeline at all.
