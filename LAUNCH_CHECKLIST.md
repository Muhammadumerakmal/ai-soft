# Launch Checklist

Transcribed from `.specs/phases/phase-05.md`. Status legend:

- **DONE** — completed and verified in this session (locally / against the live dev database and API, not a deployed production URL, unless stated otherwise).
- **ARTIFACT READY** — the config/script/doc needed exists and is correct, but actually executing it requires a real external account this environment doesn't have.
- **BLOCKED** — needs a decision, account, or credential this session has no way to obtain, or is a genuinely unimplemented feature (called out explicitly below, not just a missing account).

## Security Checklist

| Item | Status | Notes |
|---|---|---|
| OWASP ZAP active scan — zero high-risk findings | BLOCKED | Needs a running deployed target and a ZAP license/setup; not run. |
| SonarQube — zero critical/high security hotspots | BLOCKED | No SonarQube account configured. |
| `npm audit` — zero critical/high vulnerabilities | BLOCKED | 1 high (drizzle-orm SQL-identifier-escaping advisory) + 6 moderate remain. All fixes require `npm audit fix --force` (drizzle-orm 0.33→0.45, drizzle-kit 0.24→0.31 are breaking major bumps; the postcss/next chain's suggested fix is actually a next@15→9 **downgrade**, which is not a real fix). Left untouched rather than force-applying untested breaking changes — see below. |
| CSP headers configured and functional | **DONE** | `backend/src/app.ts` — `default-src 'none'; frame-ancestors 'none'` plus helmet's other defaults. Verified live: header present on a real response. |
| CORS restricted to known origins | **DONE** | Already restricted to `env.CORS_ORIGIN` exactly (single configurable origin, not `*`) — confirmed by reading `backend/src/app.ts`, no change needed. |
| Rate limiting blocks abusive requests | **DONE** | `backend/src/middleware/rate-limit.ts`, applied globally plus a stricter limiter on auth routes. Verified live in earlier Phase 1 testing. |
| Prompt injection attempts blocked (input sanitisation) | **BLOCKED — not implemented** | This is a real gap, not just a missing account: user-supplied project descriptions are passed to the agent prompts with no injection-specific sanitization beyond normal Zod length/type validation. Mitigating this needs actual design work (e.g. delimiter-based prompt structuring, an injection-detection pass) that's out of scope for this session. |
| JWT secrets stored in Vercel Environment Variables | BLOCKED | No Vercel deployment exists in this environment. Secrets are correctly kept out of git (see below) and documented in `DEPLOYMENT.md` for whoever deploys. |
| No secrets in code, `.env`, or generated output | **DONE** | `.gitignore` excludes `.env`, `.env.local`, `.env.development`, `.env.production`. Only `.env.example` files (placeholder values) are committed. Verified by reading `.gitignore` directly. |
| All endpoints have Zod validation | **DONE** | Every route in this codebase runs through the `validate()` middleware with an explicit Zod schema — no exceptions found. |

## Performance

| Item | Status | Notes |
|---|---|---|
| API p95 response time < 200ms | ARTIFACT READY | `k6/health.js`, `k6/login.js`, `k6/projects-list.js` encode this threshold; never run against a real deployed target (noted in each script's header comment). |
| Frontend Lighthouse score > 90 | BLOCKED | No deployed frontend URL to run Lighthouse against. |
| First load JS bundle < 150KB | **Partially DONE** | Local `next build` output (see below) shows most routes' First Load JS in the 100–190KB range; `/dashboard` (186KB) and `/teams/[id]` (182KB) exceed the 150KB target. Not addressed — would need real bundle-splitting work, out of scope here. |
| Database query time < 50ms (p95) | ARTIFACT READY | No load-testing tooling run against Neon; ordinary interactive testing throughout this project has seen sub-100ms query latency on the health check, but that's not a p95 measurement under load. |

## Security (acceptance criteria section)

Duplicates the Security Checklist above — same statuses apply.

## Infrastructure

| Item | Status | Notes |
|---|---|---|
| Vercel deployment succeeds (both frontend and backend) | BLOCKED | No Vercel account. `DEPLOYMENT.md` documents the exact steps. |
| Neon production DB connected and responsive | **DONE (dev branch, not a separate prod branch)** | The Neon database used throughout this project has been live and responsive for every phase's live verification; a dedicated production branch was not provisioned since only one Neon project/branch exists in this environment. |
| Sentry captures errors with correct context | BLOCKED | No Sentry account; not integrated. |
| CI passes for every PR | **DONE** | `.github/workflows/ci.yml` created — install, build shared, typecheck backend + frontend, lint, build frontend. Every one of those steps was run locally in this session and passes cleanly (see verification section). |
| Deploy happens automatically on main merge | BLOCKED | Deliberately not implemented — no real hosting target to deploy to (see the comment at the bottom of `ci.yml`). |

## Load Testing

| Item | Status | Notes |
|---|---|---|
| 250 concurrent users, < 2s p95, zero errors | BLOCKED | No deployed target; k6 not run. |

## Launch

| Item | Status | Notes |
|---|---|---|
| Rollback procedure tested (< 15 min) | ARTIFACT READY | Procedure documented in `RUNBOOK.md`; "tested" requires a real deploy to roll back, which doesn't exist here. |
| Incident response runbook documented | **DONE** | `RUNBOOK.md`. |
| Smoke test: Register → Login → Dashboard | **DONE (dev, via API — not a deployed URL)** | Verified live against the local backend + Neon dev DB in earlier phases of this project (register, login, JWT refresh/logout all confirmed working). |
| Smoke test: Create project → Full pipeline → Approval | **DONE (dev)** | Verified live multiple times, including the full CEO→PM→Architect→[4 parallel engineering agents]→QA→DevOps→Documentation pipeline structure (10 steps / 7 stages) and the approve/reject feedback loop. |
| Smoke test: Team creation → Invitation → Access | **DONE (dev)** | Verified live with two real user accounts: team creation, invite-by-email, role-based project access (editor blocked from delete with 403). |
| Smoke test: Billing checkout → Subscription active | ARTIFACT READY | Checkout code path verified to fail gracefully (`503 BILLING_UNAVAILABLE`) with no Stripe keys configured, which is correct behavior — but the actual "checkout completes → subscription activates" flow needs real Stripe test-mode keys to exercise, which aren't available here. |
| Deploy generated project to Vercel | BLOCKED | No Vercel account; also depends on the code-generation agents (Phase 3) producing a deployable project, which itself hasn't been run through a full live pipeline execution with real file output inspected end-to-end. |

## Session verification log

Commands actually run and their results, for reference:

```
npm run build --workspace=shared    → pass
npm run typecheck --workspace=shared → pass
npm run typecheck --workspace=backend → pass
npm run typecheck --workspace=frontend → pass
npm run lint --workspace=shared     → pass (0 errors)
npm run lint --workspace=backend    → pass (0 errors, 5 complexity/console warnings)
npm run lint --workspace=frontend   → pass (0 errors, 2 complexity warnings)
next build (frontend, with output: 'standalone') → pass, see bundle sizes above
docker --version                     → 29.4.0 (CLI present)
docker build ...                     → FAILED: Docker daemon not running in this environment
                                        (Dockerfiles are written carefully and the frontend's
                                        standalone output layout was verified to match the
                                        Dockerfile's COPY paths via a real `next build`, but the
                                        images themselves were never actually built.)
npm audit                            → 7 vulnerabilities (6 moderate, 1 high), all require --force
```
