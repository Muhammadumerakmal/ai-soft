# Backend Architecture — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | BE-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | Runtime |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type-safe language |
| Drizzle ORM | Latest | Database ORM |
| Neon PostgreSQL | Serverless | Database |
| Redis (Upstash) | Latest | Cache, queue backend |
| BullMQ | Latest | Job queue for agent execution |
| Socket.IO | 4.x | Real-time WebSocket |
| Zod | Latest | Validation |
| Pino | Latest | Structured logging |
| Helmet | Latest | Security headers |
| express-rate-limit | Latest | Rate limiting |
| OpenAI Agents SDK | Latest | Agent orchestration |
| bcrypt | Latest | Password hashing |
| jsonwebtoken | Latest | JWT handling |

---

## 2. Directory Structure

```
backend/
  src/
    config/
      index.ts              # Centralised config from env vars
      database.ts           # DB connection config
      redis.ts              # Redis connection
      openai.ts             # OpenAI client config
      cors.ts               # CORS configuration
    middleware/
      auth.ts               # JWT verification middleware
      validate.ts           # Zod validation middleware factory
      rate-limit.ts         # Rate limiting middleware
      error-handler.ts      # Global error handler
      logging.ts            # Request logging (Pino)
      cors.ts               # CORS middleware
    routes/
      index.ts              # Route aggregator
      auth.routes.ts
      user.routes.ts
      project.routes.ts
      agent.routes.ts
      team.routes.ts
      deployment.routes.ts
      billing.routes.ts
    controllers/
      auth.controller.ts
      user.controller.ts
      project.controller.ts
      agent.controller.ts
      team.controller.ts
      deployment.controller.ts
      billing.controller.ts
    services/
      auth.service.ts
      user.service.ts
      project.service.ts
      agent.service.ts
      orchestrator.service.ts   # Agent pipeline orchestration
      file-generation.service.ts # Writing generated files
      deployment.service.ts
      team.service.ts
      token.service.ts
      email.service.ts
    orchestrator/
      index.ts              # Orchestrator entry point
      pipeline.ts           # Pipeline definition and sequencing
      agent-executor.ts     # OpenAI Agents SDK runner wrapper
      context-builder.ts    # Builds context from previous outputs
      approval-gate.ts      # Approval management
      feedback-loop.ts      # Feedback processing
    agents/                  # Agent-specific configuration
      ceo.agent.ts
      pm.agent.ts
      architect.agent.ts
      ui-designer.agent.ts
      db-engineer.agent.ts
      backend-engineer.agent.ts
      frontend-engineer.agent.ts
      qa.agent.ts
      devops.agent.ts
      documentation.agent.ts
      prompts/
        ceo.prompt.ts
        pm.prompt.ts
        architect.prompt.ts
        # ... per-agent system prompts
    mcp/
      client.ts             # MCP client wrapper
      tools.ts              # MCP tool definitions converted for SDK
    ws/
      index.ts              # WebSocket server setup
      handlers.ts           # Connection, subscription, event handlers
    db/
      index.ts              # DB client export
      schema/
        index.ts
        users.ts
        teams.ts
        memberships.ts
        projects.ts
        agent-outputs.ts
        approvals.ts
        project-files.ts
        deployments.ts
        project-events.ts
        enums.ts
      migrations/
      seed/
        seed.ts
    types/
      express.d.ts          # Express Request augmentation
      index.ts              # Shared types
    utils/
      hash.ts               # Hashing utilities
      token.ts              # JWT utilities
      errors.ts             # Custom error classes
      logger.ts             # Pino logger instance
    app.ts                  # Express app setup
    server.ts               # Server entry point
  tsconfig.json
  package.json
  .env.example
  drizzle.config.ts
```

---

## 3. MVC + Service Layer Pattern

### 3.1 Layer Responsibilities
```
┌────────────────────────────────────────────────────────────┐
│                      HTTP Request                           │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                    Middleware Stack                         │
│  cors → logging → rate-limit → auth → validate → ...      │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                   Controller Layer                          │
│  - Parse request params, body, headers                     │
│  - Call appropriate service method                         │
│  - Format and send HTTP response                           │
│  - No business logic                                      │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                    Service Layer                            │
│  - Business logic                                          │
│  - Orchestrate multiple operations                          │
│  - Call repositories / external services                   │
│  - Throw custom errors                                     │
│  - No HTTP awareness                                       │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                    Data / External Layer                    │
│  - Drizzle ORM (database queries)                          │
│  - Redis (cache, queue)                                    │
│  - OpenAI API (LLM calls)                                  │
│  - MCP Client (tool invocations)                           │
│  - External APIs (Context7, Vercel, Stripe, GitHub)       │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Controller Example
```typescript
// controllers/project.controller.ts
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.createProject({
        userId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        techStack: req.body.techStack,
        teamId: req.body.teamId
      });

      // Trigger pipeline asynchronously
      this.projectService.startOrchestration(project.id).catch(next);

      res.status(201).json({
        success: true,
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  };
}
```

### 3.3 Service Example
```typescript
// services/project.service.ts
export class ProjectService {
  constructor(
    private db: DrizzleClient,
    private orchestrator: OrchestratorService
  ) {}

  async createProject(input: CreateProjectInput): Promise<Project> {
    const [project] = await this.db.insert(projects)
      .values({
        userId: input.userId,
        title: input.title,
        description: input.description,
        techStack: input.techStack,
        teamId: input.teamId,
        status: 'draft',
        currentPhase: 'ideation'
      })
      .returning();

    return project;
  }

  async startOrchestration(projectId: string): Promise<void> {
    await this.orchestrator.startPipeline(projectId);
  }

  async getProjectWithOutputs(projectId: string, userId: string): Promise<ProjectDetail> {
    const project = await this.db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
      with: {
        agentOutputs: {
          orderBy: [desc(agentOutputs.createdAt)]
        },
        projectFiles: true,
        deployments: {
          orderBy: [desc(deployments.createdAt)],
          limit: 1
        }
      }
    });

    if (!project) throw new NotFoundError('Project not found');
    return project;
  }
}
```

---

## 4. Middleware Stack

```typescript
// app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/logging';
import { routes } from './routes';
import { corsConfig } from './config/cors';

const app = express();

// Global middleware (applied to all routes)
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// Routes
app.use('/api/v1', routes);

// Error handler (must be last)
app.use(errorHandler);
```

---

## 5. Error Handling

### 5.1 Custom Error Classes
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown[]) {
    super(400, 'VALIDATION_ERROR', 'Validation failed', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}
```

### 5.2 Global Error Handler
```typescript
// middleware/error-handler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, requestId: req.id }, 'Request error');

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  }

  // Unknown error — don't leak details in production
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    },
    meta: { requestId: req.id, timestamp: new Date().toISOString() }
  });
};
```

---

## 6. Validation Middleware

```typescript
// middleware/validate.ts
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      }));

      throw new ValidationError(details);
    }

    req[source] = result.data;
    next();
  };
};
```

---

## 7. Orchestrator Architecture

### 7.1 Pipeline Definition
```typescript
// orchestrator/pipeline.ts
export const PIPELINE_DEFINITION: PipelineStage[] = [
  { phase: 'ideation', agentType: 'ceo', parallel: false, requiresApproval: true },
  { phase: 'planning', agentType: 'pm', parallel: false, requiresApproval: true },
  { phase: 'architecture', agentType: 'architect', parallel: false, requiresApproval: true },
  {
    phase: 'implementation',
    agents: [
      { agentType: 'ui_designer', parallel: true },
      { agentType: 'db_engineer', parallel: true },
      { agentType: 'backend_engineer', parallel: true },
      { agentType: 'frontend_engineer', parallel: true }
    ],
    requiresApproval: true
  },
  { phase: 'testing', agentType: 'qa', parallel: false, requiresApproval: true },
  { phase: 'deployment', agentType: 'devops', parallel: false, requiresApproval: false },
  { phase: 'delivery', agentType: 'documentation', parallel: false, requiresApproval: true }
];
```

### 7.2 Orchestrator Service
```typescript
// services/orchestrator.service.ts
export class OrchestratorService {
  constructor(
    private agentExecutor: AgentExecutor,
    private approvalGate: ApprovalGateService,
    private projectService: ProjectService,
    private wsGateway: WSGateway,
    private queue: Queue
  ) {}

  async startPipeline(projectId: string): Promise<void> {
    await this.projectService.updateStatus(projectId, 'running');

    for (const stage of PIPELINE_DEFINITION) {
      await this.executeStage(projectId, stage);
    }

    await this.projectService.updateStatus(projectId, 'completed');
    this.wsGateway.emit(projectId, 'project:completed', { projectId });
  }

  private async executeStage(projectId: string, stage: PipelineStage): Promise<void> {
    await this.projectService.updatePhase(projectId, stage.phase);

    if (stage.parallel && stage.agents) {
      // Execute parallel agents concurrently
      const promises = stage.agents.map(agent =>
        this.queue.add(`${agent.agentType}:${projectId}`, {
          projectId,
          agentType: agent.agentType,
          phase: stage.phase
        })
      );
      await Promise.all(promises);
    } else {
      // Execute single agent
      await this.queue.add(`${stage.agentType}:${projectId}`, {
        projectId,
        agentType: stage.agentType,
        phase: stage.phase
      });
    }

    if (stage.requiresApproval) {
      await this.projectService.updateStatus(projectId, 'awaiting_approval');
      await this.approvalGate.waitForApproval(projectId, stage);
    }
  }
}
```

---

## 8. BullMQ Worker

```typescript
// orchestrator/worker.ts
const worker = new Worker('agent-jobs', async (job) => {
  const { projectId, agentType } = job.data;
  const agent = agentRegistry.get(agentType);

  const result = await agentExecutor.run({
    agent,
    projectId,
    onProgress: (progress) => {
      job.updateProgress(progress);
      wsGateway.emit(projectId, 'agent:progress', { agentType, progress });
    },
    onToolUse: (tool, input, output) => {
      wsGateway.emit(projectId, 'agent:tool_use', { agentType, tool, input, output });
    }
  });

  // Store output
  await storeAgentOutput(projectId, agentType, result);

  // Generate files
  await fileGenService.generateFiles(projectId, agentType, result);

  wsGateway.emit(projectId, 'agent:complete', { agentType });

  return result;
}, { connection: redisConnection });
```

---

## 9. WebSocket Gateway

```typescript
// ws/index.ts
export class WSGateway {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: corsConfig,
      path: '/ws'
    });

    this.io.use(authWebSocket);
    this.io.on('connection', this.handleConnection);
  }

  private handleConnection = (socket: Socket) => {
    const { projectId } = socket.handshake.query;

    socket.join(`project:${projectId}`);

    socket.on('subscribe', ({ projectId }) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('unsubscribe', ({ projectId }) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('ping', () => socket.emit('pong'));
  };

  emit(projectId: string, event: string, data: unknown): void {
    this.io.to(`project:${projectId}`).emit(event, data);
  }
}
```

---

## 10. Security

| Measure | Implementation |
|---------|----------------|
| **Password hashing** | bcrypt with 12 salt rounds |
| **JWT signing** | RS256 with 2048-bit key |
| **Token expiry** | Access: 15min, Refresh: 7d |
| **Helmet.js** | Secure HTTP headers |
| **Rate limiting** | Per-IP and per-user |
| **CORS** | Whitelist specific origins |
| **Input validation** | Zod on all endpoints |
| **SQL injection** | Parameterised queries via Drizzle |
| **Secrets management** | Environment variables only |
| **No secrets in code** | .env.example for documentation only |

---

## 11. Logging

```typescript
// utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.id,
      userId: req.user?.id
    }),
    err: pino.stdSerializers.err
  }
});
```

---

## 12. Testing

| Test Type | Tool | Target |
|-----------|------|--------|
| Unit (Services) | Vitest | All service methods isolated |
| Integration (API) | Vitest + Supertest | Full request → response cycle |
| Database | Vitest + Testcontainers | Query correctness with Neon |
| WebSocket | Vitest + Socket.IO test client | Real-time event correctness |
| Queue | Vitest + BullMQ test helper | Job processing and retries |

### Test Database Strategy
- Use Neon preview branches for integration tests
- Each test suite creates isolated test data
- Transactions rolled back after each test
- CI uses ephemeral Neon database branch
