# AI Architecture

## Overview

Multi-agent orchestration where specialised AI agents — each with a distinct role, system prompt, and tool access — collaborate to build a complete software project. Built on the OpenAI Agents SDK.

## Agent Pipeline

```
User Input → CEO → (approve) → PM → (approve) → Architect → (approve)
    → [UI Designer, DB Engineer, Backend Engineer, Frontend Engineer] (parallel)
    → (approve) → QA → (approve) → DevOps → Doc → (approve) → Delivery
```

Each stage pauses for user approval. Rejection triggers re-execution with feedback (max 3 iterations).

## Agent Specifications

### CEO Agent
- **Purpose:** Interpret user description, scope project, clarify ambiguity
- **Tools:** Context7 (tech stack research)
- **Output:** Project charter (vision, scope, audience, success criteria, tech stack)
- **Max Tokens:** 4,000 | **Temperature:** 0.7

### PM Agent
- **Purpose:** Transform vision into product backlog, user stories, acceptance criteria
- **Tools:** Context7 (market research)
- **Output:** Complete PRD (executive summary, personas, features, user stories, NFRs)
- **Max Tokens:** 8,000 | **Temperature:** 0.5

### Architect Agent
- **Purpose:** Design system architecture, component decomposition, technology decisions
- **Tools:** Context7 (framework docs, best practices)
- **Output:** SRS, SDD, all architecture specification documents
- **Max Tokens:** 12,000 | **Temperature:** 0.3

### UI Designer Agent
- **Purpose:** Design component hierarchy, layout, theme, Radix UI integration
- **Tools:** Context7 (shadcn/ui, Radix UI, Tailwind docs)
- **Output:** Component tree, theme config, layout spec, page tree
- **Max Tokens:** 6,000 | **Temperature:** 0.4

### DB Engineer Agent
- **Purpose:** Design schema, indexes, migrations, seed data
- **Tools:** Context7 (Drizzle, Neon docs)
- **Output:** Drizzle schema files, migration SQL, seed scripts
- **Max Tokens:** 8,000 | **Temperature:** 0.2

### Backend Engineer Agent
- **Purpose:** Implement Express.js MVC with routes, controllers, services, middleware
- **Tools:** Context7 (Express.js docs), File (read/write), Shell (npm)
- **Output:** Complete backend codebase in `backend/`
- **Max Tokens:** 16,000 | **Temperature:** 0.2

### Frontend Engineer Agent
- **Purpose:** Implement Next.js pages, components, API client hooks, styling
- **Tools:** Context7 (Next.js, React, shadcn/ui docs), File, Shell
- **Output:** Complete frontend codebase in `frontend/`
- **Max Tokens:** 16,000 | **Temperature:** 0.2

### QA Agent
- **Purpose:** Generate test plans, test suites, E2E tests, security review
- **Tools:** File (read), Code Analysis (lint, typecheck)
- **Output:** Test files, test plan document, QA report
- **Max Tokens:** 8,000 | **Temperature:** 0.3

### DevOps Agent
- **Purpose:** Configure Docker, CI/CD, Vercel deployment, env management
- **Tools:** File (read/write), Shell (npm, docker)
- **Output:** Dockerfile, CI workflow, vercel.json, .env.example
- **Max Tokens:** 6,000 | **Temperature:** 0.2

### Documentation Agent
- **Purpose:** Compile README, API docs, deployment guide
- **Tools:** File (read/write)
- **Output:** README.md, CONTRIBUTING.md, DEPLOYMENT.md, API_REFERENCE.md
- **Max Tokens:** 8,000 | **Temperature:** 0.3

## Token Budget Management

| Agent | Input Limit | Output Limit | Total |
|-------|------------|-------------|-------|
| CEO | 4,000 | 4,000 | 8,000 |
| PM | 8,000 | 8,000 | 16,000 |
| Architect | 12,000 | 12,000 | 24,000 |
| UI Designer | 8,000 | 6,000 | 14,000 |
| DB Engineer | 8,000 | 8,000 | 16,000 |
| Backend Engineer | 12,000 | 16,000 | 28,000 |
| Frontend Engineer | 12,000 | 16,000 | 28,000 |
| QA | 16,000 | 8,000 | 24,000 |
| DevOps | 16,000 | 6,000 | 22,000 |
| Documentation | 24,000 | 8,000 | 32,000 |
| **Total** | | | **212,000** |

**Cost estimate:** ~$0.50–$2.00 per project (GPT-4o pricing). Feedback loop iterations increase cost linearly.

## Prompt Architecture

Every agent prompt follows the same structure:
```
You are {ROLE}. Your purpose is {PURPOSE}.

## Project Context
{accumulated context from previous agents}

## Current Task
{task description}

## Available Tools
{tool descriptions}

## Output Format
{JSON schema of expected output}

## Quality Constraints
- {constraint 1}
- {constraint 2}
```

## Error Handling

- **LLM API failures:** Automatic retry with exponential backoff (3 attempts). Fallback model (GPT-4o-mini) if primary unavailable.
- **Hallucination detection:** Schema validation against expected output shape. Consistency checks against previous agent context.
- **Timeout handling:** Per-agent timeout of 5 minutes. Partial output capture on timeout. User notified with retry option.

## Agent Execution Model

```
POST /projects/:id/approve
  → BullMQ enqueue agent job
  → Worker dequeues
  → OpenAI Agents SDK (Runner.run)
  → MCP tools invoked as needed
  → Output stored in agent_outputs table
  → Files written via FileGenerationService
  → WebSocket emits agent:awaiting_approval
  → Pipeline paused
```

## Observability

- Agent start/completion timestamps
- Tokens used per agent per execution
- Tool invocation count and results
- User feedback content (sanitised)
- Approval decisions with timestamps
- Pipeline state transitions
