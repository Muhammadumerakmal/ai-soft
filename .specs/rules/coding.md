# Coding Standards

## Language & Runtime

- **TypeScript:** Strict mode required (`strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`)
- **No `any` type:** Use `unknown` with type narrowing
- **Node.js:** Version 20 LTS minimum
- **Package Manager:** npm (with lockfile committed)

## Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| Files | kebab-case | `project-service.ts` |
| Directories | kebab-case | `src/services/` |
| Classes | PascalCase | `class ProjectService` |
| Functions/Methods | camelCase | `createProject()` |
| Variables | camelCase | `const projectName` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `type ProjectStatus` |
| Enums (type) | PascalCase | `enum ProjectStatus` |
| Enums (values) | UPPER_SNAKE_CASE | `DRAFT, RUNNING` |
| React Components | PascalCase | `function ProjectCard()` |
| React Hooks | camelCase + `use` | `useProject()` |
| DB Tables | snake_case (plural) | `users`, `agent_outputs` |
| DB Columns | snake_case | `created_at` |
| API Routes | kebab-case | `/api/v1/project-files` |
| Zod Schemas | camelCase + `Schema` | `createProjectSchema` |

## File Organisation

- **Max 400 lines** per TypeScript file (excluding imports)
- **Max 300 lines** per React component
- One primary export per file (default export preferred)
- Supporting types can be co-located
- Utilities extracted to separate files

## Import Order

```typescript
// 1. Node.js built-ins
import crypto from 'node:crypto';

// 2. Third-party (alphabetical)
import cors from 'cors';
import express from 'express';
import { z } from 'zod';

// 3. Internal modules (alphabetical by path)
import { ProjectService } from '@/services/project.service';
import { validate } from '@/middleware/validate';

// 4. Types
import type { Request, Response } from 'express';
import type { Project } from '@/types';
```

## Code Style

- **Indentation:** 2 spaces (no tabs)
- **Semicolons:** Required
- **Quotes:** Single quotes for strings; double quotes for JSX
- **Trailing commas:** ES5 (multiline objects/arrays)
- **Line length:** 100 characters max
- **Async/await** over raw promises
- **Early returns** for guard clauses

## What Is NOT Allowed

```typescript
const x: any = ...;              // No 'any' type
const y = data as any;           // No type assertion to any
// @ts-ignore                    // No suppress comments
// @ts-nocheck                   // No file-level disable
console.log('debug');            // No console.log (use logger)
eval(code);                      // No eval
require('module');               // No CommonJS (ESM only)
process.env.VAR                  // No direct env access (use config object)
```

## TypeScript Patterns

```typescript
// Prefer type over interface
type Project = { id: string; title: string };

// Use const assertions for literal types
const STATUS_VALUES = ['draft', 'running', 'completed'] as const;
type ProjectStatus = (typeof STATUS_VALUES)[number];

// Use satisfies for type inference
const config = { port: 3001, host: 'localhost' } satisfies AppConfig;

// Discriminated unions for state
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Utility types over manual definitions
type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
```

## Error Handling

```typescript
// Throw custom error classes
throw new NotFoundError('Project');

// Never catch and swallow
try {
  await riskyOperation();
} catch (error) {
  logger.error({ error }, 'Operation failed');
  throw error;
}
```

## Testing Standards

- **Naming:** `{entity}.{test-type}.test.ts` (e.g., `project.service.test.ts`)
- **Structure:** AAA pattern (Arrange, Act, Assert)
- **Coverage targets:** Services > 90%, Controllers > 80%, Components > 70%

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`

**Examples:**
```
feat(auth): add JWT refresh token rotation
fix(pipeline): handle agent timeout gracefully
docs(api): update endpoint documentation
```

## Branching Strategy

- `main` — Production-ready
- `feat/*` — Feature branches
- `fix/*` — Bug fix branches
- `chore/*` — Maintenance tasks
