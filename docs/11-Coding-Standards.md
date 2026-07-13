# Coding Standards — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | CS-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Language & Runtime

- **TypeScript**: Strict mode required (`strict: true`)
- **No `any` type**: Use `unknown` and type narrowing instead
- **Node.js**: Version 20 LTS minimum
- **Package Manager**: npm (with lockfile)

---

## 2. TypeScript Configuration

```jsonc
// tsconfig.json (shared base)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## 3. Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| **Files** | `kebab-case` | `project-service.ts`, `auth.controller.ts` |
| **Directories** | `kebab-case` | `src/services/`, `src/middleware/` |
| **Classes** | `PascalCase` | `class ProjectService` |
| **Functions/Methods** | `camelCase` | `createProject()`, `getUserById()` |
| **Variables** | `camelCase` | `const projectName = ...` |
| **Constants** | `UPPER_SNAKE_CASE` | `const MAX_RETRY_COUNT = 3` |
| **Types/Interfaces** | `PascalCase` | `type ProjectStatus`, `interface IUser` |
| **Enums** | `PascalCase` (type), `UPPER_SNAKE_CASE` (values) | `enum ProjectStatus { DRAFT, RUNNING }` |
| **React Components** | `PascalCase` | `function ProjectCard()` |
| **React Hooks** | `camelCase` with `use` prefix | `useProject()`, `useAuth()` |
| **Database Tables** | `snake_case` (plural) | `users`, `agent_outputs` |
| **Database Columns** | `snake_case` | `created_at`, `user_id` |
| **API Routes** | `kebab-case` | `/api/v1/project-files` |
| **Environment Variables** | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `OPENAI_API_KEY` |

---

## 4. File Organization

### Maximum File Size
- **TypeScript files**: Max 400 lines (excluding imports)
- **React components**: Max 300 lines
- **CSS files**: Max 500 lines

### Single Responsibility
- One primary export per file (default export preferred for main entity)
- Supporting types can be co-located
- Utilities extracted to separate files

### Import Order
```typescript
// 1. Node.js built-ins
import crypto from 'node:crypto';

// 2. Third-party packages (alphabetical)
import cors from 'cors';
import express from 'express';
import { z } from 'zod';

// 3. Internal modules (alphabetical by path)
import { ProjectService } from '@/services/project.service';
import { validate } from '@/middleware/validate';
import { errors } from '@/utils/errors';

// 4. Types
import type { Request, Response } from 'express';
import type { Project } from '@/types';
```

---

## 5. Code Style

### 5.1 General
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Required
- **Quotes**: Single quotes prefered for strings; double quotes for JSX/HTML
- **Trailing commas**: ES5 style (trailing commas on multiline objects/arrays)
- **Line length**: 100 characters max

### 5.2 Functions
```typescript
// Prefer arrow functions for callbacks and function expressions
const handleClick = () => { ... };

// Named function declarations for top-level exports
export async function createProject(input: CreateProjectInput): Promise<Project> { ... }

// Async/await over raw promises
const result = await service.method();

// Early returns for guard clauses
if (!user) throw new UnauthorizedError();
```

### 5.3 Error Handling
```typescript
// Throw custom error classes
throw new NotFoundError('Project');

// Never catch and swallow without logging
try {
  await riskyOperation();
} catch (error) {
  logger.error({ error }, 'Operation failed');
  throw error; // Re-throw unless handled
}

// Use .catch() only at top-level async boundaries
startServer().catch((error) => {
  logger.fatal({ error }, 'Failed to start server');
  process.exit(1);
});
```

### 5.4 TypeScript Specific
```typescript
// Prefer type over interface (unless declaration merging needed)
type Project = {
  id: string;
  title: string;
};

// Use const assertions for literal types
const STATUS_VALUES = ['draft', 'running', 'completed'] as const;
type ProjectStatus = (typeof STATUS_VALUES)[number];

// Use satisfies for type inference without widening
const config = {
  port: 3001,
  host: 'localhost'
} satisfies AppConfig;

// Discriminated unions for state
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Utility types over manual type definitions
type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
```

---

## 6. React / Frontend Standards

### 6.1 Component Patterns
```typescript
// Server Component (default — no 'use client' directive)
async function ProjectList() {
  const projects = await getProjects();
  return <div>{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}

// Client Component (explicit 'use client')
'use client';
function ApprovalPanel({ outputId }: { outputId: string }) {
  const [comment, setComment] = useState('');
  // ...
}

// Props interface naming
type ProjectCardProps = {
  project: Project;
  onSelect: (id: string) => void;
};

// Destructure props in function signature
function ProjectCard({ project, onSelect }: ProjectCardProps) { ... }
```

### 6.2 Hooks
```typescript
// Custom hooks return object for consistency
function useProject(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.getProject(id)
  });

  return { project: data, isLoading, error };
}
```

### 6.3 State Management
- Server state: TanStack Query
- Auth state: React Context
- Form state: React Hook Form
- UI state: `useState` / `useReducer`
- URL state: `useSearchParams` / `useParams`

---

## 7. Backend Standards

### 7.1 Controller Pattern
```typescript
// Controllers only handle HTTP concerns
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.createProject({
        userId: req.user.id,
        ...req.body
      });
      res.status(201).json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  };
}
```

### 7.2 Service Pattern
```typescript
// Services contain business logic, no HTTP awareness
export class ProjectService {
  constructor(
    private db: DrizzleClient,
    private orchestrator: OrchestratorService
  ) {}

  async createProject(input: CreateProjectInput): Promise<Project> {
    const [project] = await this.db.insert(projects)
      .values({ ...input, status: 'draft' })
      .returning();

    await this.orchestrator.startPipeline(project.id).catch(
      error => logger.error({ error, projectId: project.id }, 'Pipeline failed')
    );

    return project;
  }
}
```

### 7.3 Dependency Injection
- Services receive dependencies via constructor (manual DI)
- No global singletons (except logger, db client)
- Controllers instantiated with service instances at route setup

---

## 8. Database / Drizzle Standards

```typescript
// Schema definition
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true })
});

// Query example
const project = await db.query.projects.findFirst({
  where: and(
    eq(projects.id, projectId),
    eq(projects.userId, userId),
    isNull(projects.deletedAt)
  ),
  with: {
    agentOutputs: {
      orderBy: [desc(agentOutputs.createdAt)],
      limit: 5
    }
  }
});
```

---

## 9. Testing Standards

### 9.1 Naming
```
{entity}.{test-type}.test.ts
  example: project.service.test.ts
  example: auth.routes.integration.test.ts
```

### 9.2 Test Structure (AAA Pattern)
```typescript
describe('ProjectService', () => {
  describe('createProject', () => {
    it('should create a project with draft status', async () => {
      // Arrange
      const input = { title: 'Test', description: '...', techStack: ['next.js'] };

      // Act
      const project = await projectService.createProject(input);

      // Assert
      expect(project.status).toBe('draft');
      expect(project.title).toBe('Test');
    });

    it('should throw when title is empty', async () => {
      await expect(projectService.createProject({ title: '' }))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

### 9.3 Coverage Targets
| Category | Target |
|----------|--------|
| Services (unit) | > 90% |
| Controllers (integration) | > 80% |
| Components (unit) | > 70% |
| E2E flows | All critical paths |

---

## 10. Git & Version Control

### 10.1 Branching Strategy
- `main` — Production-ready code
- `develop` — Integration branch
- `feat/*` — Feature branches
- `fix/*` — Bug fix branches
- `chore/*` — Maintenance tasks

### 10.2 Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`

**Examples:**
```
feat(auth): add JWT refresh token rotation
fix(pipeline): handle agent timeout gracefully
docs(api): update endpoint documentation
test(orchestrator): add pipeline sequencing tests
```

---

## 11. Linting & Formatting

### 11.1 ESLint Configuration
```jsonc
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "react/react-in-jsx-scope": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 11.2 Prettier Configuration
```jsonc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 12. Documentation Standards

### 12.1 JSDoc
- Required for all public API functions
- Optional for internal functions (use descriptive naming instead)
- Omit `@returns` when return type is obvious from TypeScript

```typescript
/**
 * Creates a new project and starts the agent pipeline.
 *
 * @param input - The project creation input
 * @param input.title - Project title (3-255 chars)
 * @param input.description - Project description (100-5000 chars)
 * @returns The created project with draft status
 * @throws {ValidationError} When input fails Zod validation
 */
async function createProject(input: CreateProjectInput): Promise<Project>
```

### 12.2 README Standards
Every generated project must have:
- Project name and description
- Tech stack badges
- Quick start instructions
- Available scripts
- Environment variables table
- Deployment guide link
- Contributing guide link

---

## 13. Security Standards

| Rule | Enforced By |
|------|-------------|
| No secrets in code | ESLint (no-process-env in production) + review |
| Input validation on all endpoints | Zod middleware |
| Parameterised queries only | Drizzle ORM (no raw SQL) |
| CSP headers | Helmet.js |
| No `eval()` or dynamic `require()` | ESLint rule |
| No debug/log statements in production | ESLint `no-console` |
| XSS prevention | React's built-in escaping |
| CSRF protection (if using cookies) | csurf or SameSite=Strict |
