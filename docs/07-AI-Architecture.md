# AI Architecture — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | AIA-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. AI Architecture Overview

The AI Software Company platform uses a **Multi-Agent Orchestration** approach where specialised AI agents — each with a distinct role, system prompt, and tool access — collaborate to build a complete software project.

The architecture follows the **OpenAI Agents SDK** pattern for agent lifecycle, tool use, and handoffs.

---

## 2. Core Concepts

### 2.1 Agent Definition
An agent is an AI entity with:
- **Role**: Distinct responsibility (CEO, PM, Architect, etc.)
- **System Prompt**: Role-specific instructions defining behaviour
- **Tools**: MCP-based tools available to the agent
- **Output Schema**: Structured format for agent output
- **Handoff Rules**: Conditions for passing control to the next agent

### 2.2 Pipeline
A pipeline is the ordered execution of agents. Some stages run sequentially (CEO → PM → Architect), while others run in parallel (UI Designer, DB Engineer, Backend Engineer, Frontend Engineer).

### 2.3 Context Accumulation
Each agent receives the complete output of all preceding agents as context. This ensures architectural continuity across the pipeline.

### 2.4 Orchestrator
The orchestrator manages:
- Agent lifecycle (start, monitor, handle completion/failure)
- Pipeline sequencing (sequential vs parallel stages)
- Approval gates (pausing execution for user review)
- Feedback loops (re-executing agents with user feedback)
- Token budget tracking

---

## 3. Agent Pipeline Flow

```
                    ┌──────────────┐
                    │  User Input  │
                    │  (Ideation)  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
               ┌───►│  CEO Agent   │◄─── Clarifying Q&A
               │    └──────┬───────┘
               │           │
               │    ┌──────▼───────┐
               │    │ User Approves │── No ───► (feedback loop)
               │    └──────┬───────┘
               │           │ Yes
               │    ┌──────▼───────┐
               │    │   PM Agent   │
               │    └──────┬───────┘
               │           │
               │    ┌──────▼───────┐
               │    │ User Approves │── No ───► (feedback loop)
               │    └──────┬───────┘
               │           │ Yes
               │    ┌──────▼──────────┐
               │    │ Architect Agent │
               │    └──────┬──────────┘
               │           │
               │    ┌──────▼──────────┐
               │    │  User Approves  │── No ───► (feedback loop)
               │    └──────┬──────────┘
               │           │ Yes
               │    ┌──────┴──────────────────────┐
               │    │        PARALLEL SPAWN        │
               │    │                              │
               │    ▼           ▼          ▼      ▼
               │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
               │ │  UI    │ │  DB    │ │ Backend│ │ Frontend   │
               │ │Designer│ │Engineer│ │Engineer│ │ Engineer   │
               │ └────────┘ └────────┘ └────────┘ └────────────┘
               │        │         │          │          │
               │        └────┬────┘──────────┘──────────┘
               │             │ (all complete)
               │      ┌──────▼──────────┐
               │      │  User Approves  │── No ───► (feedback loop)
               │      └──────┬──────────┘
               │             │ Yes
               │      ┌──────▼──────┐
               │      │  QA Agent   │
               │      └──────┬──────┘
               │             │
               │      ┌──────▼──────────┐
               │      │  User Approves  │── No ───► (feedback loop)
               │      └──────┬──────────┘
               │             │ Yes
               │      ┌──────▼────────┐
               │      │ DevOps Agent  │
               │      └──────┬────────┘
               │             │
               │      ┌──────▼────────────┐
               │      │ Documentation     │
               │      │ Engineer Agent    │
               │      └──────┬────────────┘
               │             │
               │      ┌──────▼──────────┐
               │      │  User Approves  │── No ───► (feedback loop)
               │      └──────┬──────────┘
               │             │ Yes
               │      ┌──────▼──────────┐
               │      │ Final Delivery  │
               │      └─────────────────┘
               │
               └── (if rejected at any gate, agent re-executes
                    with feedback, up to max iterations)
```

---

## 4. Agent Specifications

### 4.1 CEO Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | CEO / Product Visionary |
| **Purpose** | Interpret user's natural language description, define project scope, clarify ambiguity |
| **Context Sources** | User's initial input |
| **System Prompt Priority** | Understanding intent, asking clarifying questions, scoping |
| **Tools** | Context7 (tech stack research) |
| **Output** | Project charter: vision, scope, target audience, success criteria, tech stack recommendation, constraints |
| **Output Schema** | `{ vision, scope, targetAudience, successCriteria, techStack, constraints, questions[] }` |
| **Max Tokens** | 4,000 |
| **Temperature** | 0.7 |

### 4.2 Product Manager Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | Product Manager |
| **Purpose** | Transform vision into product backlog with PRD, user stories, acceptance criteria |
| **Context Sources** | CEO output |
| **System Prompt Priority** | Requirements analysis, feature prioritisation, user story mapping |
| **Tools** | Context7 (market research), project file read |
| **Output** | Complete PRD document (01-PRD.md) |
| **Output Schema** | `{ executiveSummary, targetAudience, personas, featureSet, userStories, nfrs, metrics }` |
| **Max Tokens** | 8,000 |
| **Temperature** | 0.5 |

### 4.3 Software Architect Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | Software Architect |
| **Purpose** | Design system architecture, component decomposition, technology decisions |
| **Context Sources** | CEO output + PM output + user preferences |
| **System Prompt Priority** | Architectural patterns, scalability, security, clean architecture |
| **Tools** | Context7 (framework docs, best practices), project file read |
| **Output** | SRS, SDD, System Architecture, all architecture docs (02-11) |
| **Output Schema** | Full markdown documents for each architecture spec |
| **Max Tokens** | 12,000 |
| **Temperature** | 0.3 |

### 4.4 UI Designer Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | UI/UX Designer |
| **Purpose** | Design component hierarchy, layout, theme, Radix UI integration |
| **Context Sources** | All architecture documents |
| **System Prompt Priority** | Component composition, accessibility, responsive design, Tailwind CSS theming |
| **Tools** | Context7 (shadcn/ui, Radix UI, Tailwind docs), file read |
| **Output** | Component tree specification, theme config, layout spec, page tree |
| **Output Schema** | `{ componentTree[], themeConfig, layoutSpec, pages[] }` |
| **Max Tokens** | 6,000 |
| **Temperature** | 0.4 |

### 4.5 Database Engineer Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | Database Engineer |
| **Purpose** | Design schema, indexes, migrations, seed data |
| **Context Sources** | Architecture docs |
| **System Prompt Priority** | Drizzle ORM patterns, PostgreSQL optimisation, migration best practices |
| **Tools** | Context7 (Drizzle, Neon docs), file read/write |
| **Output** | Drizzle schema files, migration SQL, seed scripts, index definitions |
| **Output Schema** | `{ tables[], enums[], indexes[], migrations[], seedData[] }` |
| **Max Tokens** | 8,000 |
| **Temperature** | 0.2 |

### 4.6 Backend Engineer Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | Backend Engineer |
| **Purpose** | Implement Express.js MVC structure with all routes, controllers, services, middleware |
| **Context Sources** | Architecture docs + DB schema |
| **System Prompt Priority** | Express.js patterns, TypeScript, middleware stack, error handling, Zod validation |
| **Tools** | Context7 (Express.js, Zod docs), file read/write, shell (npm) |
| **Output** | Complete backend codebase in `backend/` directory |
| **Output Schema** | File list with content |
| **Max Tokens** | 16,000 |
| **Temperature** | 0.2 |

### 4.7 Frontend Engineer Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | Frontend Engineer |
| **Purpose** | Implement Next.js pages, components, API client hooks |
| **Context Sources** | Architecture docs + UI spec |
| **System Prompt Priority** | Next.js App Router, React Server/Client Components, shadcn/ui, Tailwind |
| **Tools** | Context7 (Next.js, React, shadcn/ui docs), file read/write, shell (npm) |
| **Output** | Complete frontend codebase in `frontend/` directory |
| **Output Schema** | File list with content |
| **Max Tokens** | 16,000 |
| **Temperature** | 0.2 |

### 4.8 QA Engineer Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | QA Engineer |
| **Purpose** | Generate test plans, test suites, E2E tests, security review |
| **Context Sources** | All generated code |
| **System Prompt Priority** | Testing best practices, Playwright, Vitest, security scanning |
| **Tools** | Context7 (Playwright, Vitest docs), file read/write, shell (run tests) |
| **Output** | Test files, test plan document, QA report |
| **Output Schema** | `{ testPlan, unitTests[], integrationTests[], e2eTests[], securityReport }` |
| **Max Tokens** | 8,000 |
| **Temperature** | 0.3 |

### 4.9 DevOps Engineer Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | DevOps Engineer |
| **Purpose** | Configure Docker, CI/CD, Vercel deployment, environment management |
| **Context Sources** | All project outputs |
| **System Prompt Priority** | Docker, GitHub Actions, Vercel, environment security |
| **Tools** | Context7 (Docker, Vercel docs), file read/write, shell |
| **Output** | Dockerfile, docker-compose.yml, CI workflow, vercel.json, .env.example |
| **Output Schema** | File list with configuration content |
| **Max Tokens** | 6,000 |
| **Temperature** | 0.2 |

### 4.10 Documentation Engineer Agent

| Attribute | Specification |
|-----------|---------------|
| **Role** | Documentation Engineer |
| **Purpose** | Compile README, API docs, deployment guide, developer onboarding |
| **Context Sources** | All previous outputs + generated code |
| **System Prompt Priority** | Concise technical writing, comprehensive coverage, clarity |
| **Tools** | File read/write |
| **Output** | README.md, CONTRIBUTING.md, DEPLOYMENT.md, API_REFERENCE.md |
| **Output Schema** | File list with markdown content |
| **Max Tokens** | 8,000 |
| **Temperature** | 0.3 |

---

## 5. OpenAI Agents SDK Integration

### 5.1 Agent Configuration
```typescript
import { Agent, Runner, Tool } from 'openai-agents-sdk';

const ceoAgent = new Agent({
  name: 'CEO Agent',
  instructions: 'You are the CEO...',
  tools: [context7Tool],
  outputType: CEOOutput,
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4000
});

const pmAgent = new Agent({
  name: 'Product Manager',
  instructions: 'You are the Product Manager...',
  tools: [context7Tool, fileReadTool],
  outputType: PMOutput,
  model: 'gpt-4o',
  temperature: 0.5,
  maxTokens: 8000
});
```

### 5.2 Agent Runner
```typescript
const result = await Runner.run(ceoAgent, userInput, {
  context: { projectId, userId },
  maxTurns: 20
});
```

### 5.3 Tool Definitions
```typescript
const context7Tool = new Tool({
  name: 'context7_lookup',
  description: 'Query Context7 for current library documentation',
  parameters: {
    libraryName: z.string(),
    query: z.string()
  },
  execute: async ({ libraryName, query }) => {
    return await context7Service.query(libraryName, query);
  }
});
```

---

## 6. Prompt Engineering Strategy

### 6.1 System Prompt Structure
```
You are {ROLE}. Your purpose is {PURPOSE}.

## Context
{accumulated context from previous agents}

## Current Task
{task description}

## Available Tools
{tool descriptions}

## Output Format
{JSON schema of expected output}

## Constraints
- {constraint 1}
- {constraint 2}

## Current Project
- Name: {project title}
- Description: {project description}
- Tech Stack: {techStack}
```

### 6.2 Prompt Injection Mitigation
- User input is always sanitised before inclusion in prompts
- User input is placed in a separate `user_input` section, not interleaved with instructions
- System prompt instructions are validated for integrity
- Output is validated against expected schema before storage

---

## 7. Token Budget Management

| Agent | Max Input Tokens | Max Output Tokens | Total Budget |
|-------|-----------------|-------------------|--------------|
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

### Cost Estimation
- GPT-4o: ~$2.50/1M input tokens, ~$10.00/1M output tokens
- Average project cost: ~$0.50 - $2.00 in LLM API costs
- Feedback loop iterations increase cost linearly

---

## 8. Error Handling & Recovery

### 8.1 LLM API Failures
- Automatic retry with exponential backoff (3 attempts)
- Fallback model (GPT-4o-mini) if primary unavailable
- Graceful degradation: return partial output with warning

### 8.2 Hallucination Detection
- Schema validation: output must match expected schema
- Consistency checks: cross-reference with context from previous agents
- Confidence scoring: low-confidence outputs flagged for user review

### 8.3 Timeout Handling
- Per-agent timeout: 5 minutes (configurable)
- Partial output capture on timeout
- User notified with option to retry or proceed with partial output

---

## 9. Observability & Logging

### 9.1 Logged Data
- Agent start/completion timestamps
- Tokens used per agent
- Tool invocation count and results
- User feedback content (sanitised)
- Approval decisions
- Pipeline state transitions

### 9.2 Monitoring
- Pipeline completion rate
- Average tokens per project
- Per-agent failure rate
- User approval rate per agent type
- Average feedback loop count

---

## 10. Future AI Enhancements

| Enhancement | Phase | Description |
|-------------|-------|-------------|
| Multi-model routing | 3 | Use different models per agent (GPT-4o for complex, GPT-4o-mini for simple) |
| Agent collaboration | 3 | Agents can communicate and negotiate via the orchestrator |
| Code review agent | 3 | Dedicated agent that reviews generated code before QA |
| Fine-tuned models | 4 | Fine-tune on generated project patterns for improved quality |
| Self-healing pipeline | 5 | Automatic error correction without user intervention |
| Learning from feedback | 5 | Implicit improvement based on historical user approvals/rejections |
