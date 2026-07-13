# Database Rules & Conventions

## Technology

- **Provider:** Neon PostgreSQL 16 (serverless)
- **ORM:** Drizzle ORM
- **Migration:** Drizzle Kit
- **Connection:** Pooled via pgBouncer (transaction mode)

## Schema Design Rules

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Tables | snake_case, plural | `users`, `agent_outputs` |
| Columns | snake_case | `created_at`, `password_hash` |
| Primary keys | `id` (UUID) | `id uuid primary key default gen_random_uuid()` |
| Foreign keys | `{referenced_table}_id` | `project_id`, `user_id` |
| Enums | snake_case | `project_status`, `agent_type` |
| Indexes | `idx_{table}_{columns}` | `idx_projects_user_status` |
| Unique constraints | `{table}_{columns}_unique` | Handled by Drizzle |

### Required Columns on Every Table

```typescript
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... business columns
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),  // soft delete
});
```

### Soft Deletes

- All user-facing entities use soft deletes (`deletedAt` timestamp)
- Queries must include `isNull(table.deletedAt)` in WHERE clauses
- DELETE API endpoints set `deletedAt`, never hard-delete

## Drizzle Schema Patterns

### Table Definition

```typescript
import { pgTable, uuid, varchar, timestamp, text, jsonb, integer } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  techStack: jsonb('tech_stack').notNull().$type<string[]>(),
  status: projectStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
```

### Enum Definition

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const projectStatus = pgEnum('project_status', [
  'draft', 'running', 'awaiting_approval', 'completed', 'failed'
]);
```

### Relations

```typescript
import { relations } from 'drizzle-orm';

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  agentOutputs: many(agentOutputs),
  projectFiles: many(projectFiles),
  deployments: many(deployments),
  projectEvents: many(projectEvents),
}));
```

## Query Patterns

### Basic CRUD

```typescript
// Create
const [project] = await db.insert(projects).values({ userId, title, description }).returning();

// Read with relations
const project = await db.query.projects.findFirst({
  where: and(eq(projects.id, id), isNull(projects.deletedAt)),
  with: { agentOutputs: true }
});

// Update
const [updated] = await db.update(projects)
  .set({ title: 'New Title' })
  .where(eq(projects.id, id))
  .returning();

// Soft delete
await db.update(projects)
  .set({ deletedAt: new Date() })
  .where(eq(projects.id, id));
```

### Transaction Pattern

```typescript
await db.transaction(async (tx) => {
  const [project] = await tx.insert(projects).values({ ... }).returning();
  await tx.insert(projectEvents).values({
    projectId: project.id,
    eventType: 'project:created',
    payload: {}
  });
  return project;
});
```

### Pagination

```typescript
const page = 1, limit = 20;
const projects = await db.query.projects.findMany({
  where: and(eq(projects.userId, userId), isNull(projects.deletedAt)),
  orderBy: [desc(projects.createdAt)],
  offset: (page - 1) * limit,
  limit,
});

const [{ count }] = await db.select({ count: count() })
  .from(projects)
  .where(eq(projects.userId, userId));
```

## Indexing Rules

- Add indexes for all foreign keys
- Add composite indexes for common query patterns
- Add partial indexes for filtered queries (e.g., `WHERE deleted_at IS NULL`)
- Use `CREATE INDEX CONCURRENTLY` in production
- Run `EXPLAIN ANALYZE` on slow queries before adding indexes

## Migration Rules

- One migration file per schema change
- Never edit existing migration files (treat as immutable)
- Always generate down migrations for rollback
- Test migrations against a copy of production data
- Run migrations as a separate step in CI/CD (not at app startup)

## Connection Pooling

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Pool configuration via Neon:** pgBouncer in transaction mode handles pooling transparently.

## Security

- No raw SQL strings (use Drizzle query builder)
- No dynamic table/column names in queries
- Connection uses TLS (enforced by Neon)
- Least-privilege database user for application (separate from migration user)
- Regular backups (daily automated via Neon)
