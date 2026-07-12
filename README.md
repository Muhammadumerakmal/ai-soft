# AI Software Company

A SaaS platform where specialized AI agents collaborate to design, build, review, and deliver software projects.

## Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v3, shadcn/ui |
| Backend  | Fastify 5, Drizzle ORM, Neon PostgreSQL, OpenAI Agents SDK    |
| Auth     | JWT (HTTP-only cookies)                                       |
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

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start all workspaces in parallel |
| `npm run dev:frontend` | Next.js dev server on :3000      |
| `npm run dev:backend`  | Fastify dev server on :4000      |
| `npm run build`        | Build all workspaces             |
| `npm run typecheck`    | TypeScript check both workspaces |
| `npm run lint`         | ESLint both workspaces           |
| `npm run clean`        | Remove all build artifacts       |

## Project Structure

```
├── frontend/          # Next.js 15 (App Router, src/)
│   ├── src/
│   │   ├── app/       # Routes & layouts
│   │   ├── components/# Shared UI components
│   │   ├── features/  # Feature-based modules
│   │   ├── hooks/     # Shared hooks
│   │   └── lib/       # Utilities & API client
├── backend/           # Fastify 5 API
│   ├── src/
│   │   ├── config/    # Env validation
│   │   ├── db/        # Drizzle schema & connection
│   │   ├── modules/   # Feature-based routes
│   │   └── shared/    # Error handling, logger
└── docs/              # Documentation
```

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Required | Description                                   |
| ---------------- | -------- | --------------------------------------------- |
| `DATABASE_URL`   | Yes      | Neon PostgreSQL connection string             |
| `JWT_SECRET`     | Yes      | At least 32 characters                        |
| `OPENAI_API_KEY` | Yes      | OpenAI API key                                |
| `NODE_ENV`       | No       | development / production / test               |
| `PORT`           | No       | Server port (default: 4000)                   |
| `CORS_ORIGIN`    | No       | Frontend URL (default: http://localhost:3000) |

### Frontend (`frontend/.env`)

| Variable              | Required | Description     |
| --------------------- | -------- | --------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API URL |

## Conventions

- Feature-based modules with self-contained routes
- Server Components by default, `'use client'` only when needed
- ESM backend with `.js` extensions in imports (resolved by tsx)
- TypeScript strict mode with no unchecked indexed access
- Prettier + ESLint enforced via lint-staged on commit
