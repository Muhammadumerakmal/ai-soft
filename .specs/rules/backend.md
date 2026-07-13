# Backend Development Rules

## Technology Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.x
- **Language:** TypeScript (strict mode)
- **ORM:** Drizzle ORM (via Neon PostgreSQL)
- **Queue:** BullMQ (via Upstash Redis)
- **Real-Time:** Socket.IO 4.x
- **Validation:** Zod
- **Logging:** Pino
- **Auth:** jsonwebtoken (RS256) + bcrypt

## MVC + Service Layer Architecture

### Layer Contract

| Layer | Responsibility | Allowed Imports | NOT Allowed |
|-------|---------------|-----------------|-------------|
| **Route** | Map URL → controller | Controller | Business logic |
| **Middleware** | Pre/post-process request | Next function | Business logic |
| **Controller** | HTTP concerns: parse, delegate, respond | Service | DB access |
| **Service** | Business logic, orchestration | Other services, DB | HTTP objects |
| **DB Query** | Data access via Drizzle | ORM only | Business logic |

### Controller Pattern

```typescript
// Controllers ONLY handle HTTP concerns
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.create(req.user.id, req.body);
      res.status(201).json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  };
}
```

**Rules:**
- One method per handler
- No conditionals in controllers
- Always delegate to service
- Always use `next(error)` for errors
- Never access `req` or `res` in services

### Service Pattern

```typescript
// Services contain ALL business logic
export class ProjectService {
  constructor(
    private db: DrizzleClient,
    private orchestrator: OrchestratorService
  ) {}

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    const [project] = await this.db.insert(projects)
      .values({ userId, ...input, status: 'draft' })
      .returning();

    this.orchestrator.startPipeline(project.id).catch(
      error => logger.error({ error, projectId: project.id }, 'Pipeline failed')
    );

    return project;
  }
}
```

**Rules:**
- All dependencies via constructor injection
- No `new` inside services (use DI)
- Throw custom error classes
- No HTTP awareness (no req/res)
- Async side effects are fire-and-forget with error logging

### Dependency Injection Pattern

```typescript
// Manual DI at route setup
const projectService = new ProjectService(db, orchestratorService);
const projectController = new ProjectController(projectService);

router.post('/projects', validate(createProjectSchema), projectController.create);
```

## Middleware Stack Order

```typescript
app.use(helmet());           // 1. Security headers
app.use(cors(corsConfig));   // 2. Cross-origin
app.use(express.json());     // 3. Body parsing
app.use(requestId);          // 4. Correlation ID
app.use(requestLogger);      // 5. HTTP logging
app.use('/api/', rateLimit); // 6. Rate limiting
app.use('/api/', auth);      // 7. JWT verification
// Routes go here
app.use(errorHandler);       // 8. Global error handler (last)
```

## Error Handling

```typescript
// Use custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown[]
  ) { super(message); }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(404, 'NOT_FOUND', `${resource} not found`); }
}

export class ValidationError extends AppError {
  constructor(details: unknown[]) { super(400, 'VALIDATION_ERROR', 'Validation failed', details); }
}
```

## Data Access with Drizzle

```typescript
// Direct Drizzle in services (no repository layer)
const project = await db.query.projects.findFirst({
  where: and(
    eq(projects.id, id),
    eq(projects.userId, userId),
    isNull(projects.deletedAt)
  ),
  with: {
    agentOutputs: { orderBy: [desc(agentOutputs.createdAt)] }
  }
});
```

**Rules:**
- No raw SQL strings (use Drizzle query builder)
- No `SELECT *` (specify columns)
- Use transactions for multi-table operations
- Use `returning()` for INSERT/UPDATE mutations

## Validation

```typescript
// Zod validation middleware factory
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) throw new ValidationError(result.error.errors);
    req[source] = result.data;
    next();
  };
};
```

## Logging

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});
```

**Rules:**
- Never use `console.log` (use `logger.info`, `logger.error`, etc.)
- Always include correlation ID: `logger.info({ reqId }, 'message')`
- No sensitive data in logs (passwords, tokens)

## File Structure

```
backend/src/
  config/        # Environment configuration
  middleware/    # Express middleware
  routes/        # Route definitions
  controllers/   # HTTP handlers
  services/      # Business logic
  orchestrator/  # Agent pipeline engine
  agents/        # AI agent definitions + prompts
  mcp/           # MCP server
  ws/            # WebSocket server
  db/            # Drizzle schema + migrations
  types/         # TypeScript type definitions
  utils/         # Shared utilities (logger, errors, hash, token)
```

## Security Rules

- No secrets in code (use env vars + config object)
- All endpoints validated with Zod
- Parameterised queries via Drizzle (no SQL injection)
- Passwords hashed with bcrypt (12 rounds)
- JWT signed with RS256 (2048-bit key)
- Rate limiting on all public endpoints
- CSP headers via Helmet.js
