# AI Software Company

A SaaS platform where specialized AI agents collaborate to design, build, review, and deliver software projects from a user's idea.

## Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v3, shadcn/ui |
| Backend  | Fastify 5, Drizzle ORM, Neon PostgreSQL, OpenAI Agents SDK    |
| Auth     | JWT (HTTP-only cookies) via @fastify/jwt                      |
| AI       | OpenAI Agents SDK + OpenRouter + MCP servers + Context7       |
| Monorepo | npm workspaces                                                |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers (both frontend + backend)
npm run dev
```

### Commands

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start all workspaces in parallel |
| `npm run dev:frontend` | Next.js dev server on :3000      |
| `npm run dev:backend`  | Fastify dev server on :4000      |
| `npm run build`        | Build all workspaces             |
| `npm run typecheck`    | TypeScript check both workspaces |
| `npm run lint`         | ESLint both workspaces           |
| `npm run clean`        | Remove all build artifacts       |
| `npm run test`         | Run tests (vitest)               |
| `npm run test:e2e`     | Run Playwright e2e tests         |

### Workspace-specific

```bash
npm run dev -w frontend          # Frontend only
npm run dev -w backend           # Backend only
npm run test -w backend          # Backend tests
npm run test:e2e -w frontend     # Frontend e2e tests
npm run db:push -w backend       # Push schema to DB
npm run db:studio -w backend     # Drizzle Studio
```

## Project Structure

```
├── frontend/                 # Next.js 15 (App Router, src/)
│   ├── src/
│   │   ├── app/              # Routes, layouts, error/loading/not-found
│   │   ├── components/       # Shared UI components (shadcn/ui)
│   │   ├── features/         # Feature-based modules (auth/)
│   │   ├── hooks/            # Shared React hooks
│   │   └── lib/              # Utilities & API client
│   ├── e2e/                  # Playwright end-to-end tests
│   └── playwright.config.ts
├── backend/                  # Fastify 5 API
│   ├── src/
│   │   ├── config/           # Environment validation (Zod)
│   │   ├── db/               # Drizzle schema, migrations, connection
│   │   ├── modules/          # Feature modules
│   │   │   ├── ai/           # AI pipeline (agents, MCP, Context7)
│   │   │   ├── auth/         # Register, login, logout, JWT
│   │   │   ├── audit/        # Audit logging service
│   │   │   ├── health/       # Health check endpoint
│   │   │   ├── organizations/
│   │   │   ├── projects/     # Project CRUD
│   │   │   └── users/        # User profile
│   │   ├── plugins/          # Fastify plugins (auth)
│   │   └── shared/           # Error handling, logger
│   ├── api/                  # Vercel serverless entry point
│   ├── vitest.config.ts
│   └── drizzle/              # Migration files
└── docs/
```

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Required | Description                                   |
| ------------------ | -------- | --------------------------------------------- |
| `DATABASE_URL`     | Yes      | Neon PostgreSQL connection string             |
| `JWT_SECRET`       | Yes      | At least 32 characters                        |
| `OPENAI_API_KEY`   | Yes      | OpenAI API key                                |
| `NODE_ENV`         | No       | development / production / test               |
| `PORT`             | No       | Server port (default: 4000)                   |
| `CORS_ORIGIN`      | No       | Frontend URL (default: http://localhost:3000) |
| `RATE_LIMIT_MAX`   | No       | Requests per minute (default: 100)            |
| `MCP_ENABLED`      | No       | Enable MCP servers (true/false)               |
| `GITHUB_TOKEN`     | No\*     | GitHub token for MCP GitHub server            |
| `POSTGRES_URL`     | No\*     | Postgres URL for MCP Postgres server          |
| `CONTEXT7_API_KEY` | No\*     | Context7 API key for live docs lookups        |

\*Required only when the corresponding MCP feature is enabled.

### Frontend (`frontend/.env`)

| Variable              | Required | Description                      |
| --------------------- | -------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API URL (no /api suffix) |
| `NEXT_PUBLIC_APP_URL` | No       | Public app URL for SEO           |
| `NEXT_PUBLIC_GA_ID`   | No       | Google Analytics measurement ID  |

## AI Pipeline

The system orchestrates 10 specialized AI agents in sequence via OpenRouter:

1. **CEO** – Project analysis and scope definition
2. **Product Manager** – Requirements and user stories
3. **Business Analyst** – Functional specifications
4. **Architect** – System architecture and tech stack
5. **Tech Lead** – Implementation plan and task breakdown
6. **Developer** – Code generation
7. **Designer** – UI/UX design specifications
8. **QA Engineer** – Test plans and quality checks
9. **Security Engineer** – Security review
10. **Documentation Writer** – Final documentation

Agents communicate via handoff chains and can use MCP servers (GitHub, Filesystem, Postgres, Playwright) and Context7 for live documentation lookups.

## Deployment

### Vercel (Frontend)

The frontend deploys as a standard Next.js project on Vercel. The root `vercel.json` configures rewrites to the API and security headers.

### Vercel (Backend API)

The backend deploys as a serverless function via `backend/api/index.ts`. The `backend/vercel.json` configures build and function settings.

```bash
# Deploy frontend
vercel --prod

# Deploy backend (from backend/ directory)
vercel --prod
```

## Conventions

- Feature-based modules with self-contained routes
- Server Components by default, `'use client'` only when needed
- ESM backend with `.js` extensions in imports (resolved by tsx)
- TypeScript strict mode with no unchecked indexed access
- Prettier + ESLint enforced via lint-staged on commit
- Zod v4 (not v3) — use top-level `z.url()`, `z.email()`, `z.uuid()`
