# Database Architecture — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | DBA-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Overview

### 1.1 Database Technology
- **Primary**: Neon PostgreSQL 16 (serverless, auto-scaling)
- **ORM**: Drizzle ORM (type-safe SQL query builder)
- **Cache/Queue**: Redis via Upstash

### 1.2 Design Principles
- Schema-first design with Drizzle
- All tables have UUID primary keys
- Soft deletes where applicable (`deletedAt` column)
- Created/updated timestamps on all tables
- Foreign keys with proper indexing
- JSONB for flexible metadata
- Enum types for status fields

---

## 2. Entity Relationship Diagram (Text)

```
┌──────────────┐        ┌───────────────────┐
│    User      │        │    Team           │
│──────────────│        │───────────────────│
│ id (PK)      │──1:N──>│ id (PK)           │
│ email        │        │ name              │
│ name         │        │ slug              │
│ passwordHash │        │ ownerId (FK)      │
│ avatarUrl    │        │ createdAt         │
│ role         │        │ updatedAt         │
│ createdAt    │        └────────┬──────────┘
│ updatedAt    │                 │ 1:N
└──────┬───────┘                 │
       │ 1:N             ┌───────┴──────────┐
       │                 │  Membership      │
       │                 │──────────────────│
       │                 │ id (PK)          │
       │                 │ userId (FK)      │
       │                 │ teamId (FK)      │
       │                 │ role (enum)      │
       │                 │ joinedAt         │
       │                 └──────────────────┘
       │
       │ 1:N
┌──────┴──────────────┐
│      Project        │
│─────────────────────│
│ id (PK)             │──1:N──> ┌──────────────────────┐
│ userId (FK)         │         │   AgentOutput        │
│ teamId (FK, NULL)   │         │──────────────────────│
│ title               │         │ id (PK)              │
│ description         │         │ projectId (FK)       │
│ techStack           │         │ agentType (enum)     │
│ status (enum)       │         │ phase (enum)         │
│ currentPhase        │         │ content (JSONB)      │
│ metadata (JSONB)    │         │ status (enum)        │
│ createdAt           │         │ iterationCount       │
│ updatedAt           │         │ feedback (TEXT?)     │
│                     │         │ tokensUsed           │
│                     │         │ startedAt            │
│                     │         │ completedAt          │
│                     │         └───────┬──────────────┘
│                     │                 │ 1:N
│                     │         ┌───────┴──────────────┐
│                     │         │   Approval           │
│                     │         │──────────────────────│
│                     │         │ id (PK)              │
│                     │         │ agentOutputId (FK)   │
│                     │         │ userId (FK)          │
│                     │         │ decision (enum)      │
│                     │         │ comment (TEXT?)      │
│                     │         │ createdAt             │
│                     │         └──────────────────────┘
│                     │
│                     │──1:N──> ┌──────────────────────┐
│                     │         │   ProjectFile        │
│                     │         │──────────────────────│
│                     │         │ id (PK)              │
│                     │         │ projectId (FK)       │
│                     │         │ filePath             │
│                     │         │ content (TEXT)       │
│                     │         │ fileType (enum)      │
│                     │         │ hash (SHA256)        │
│                     │         │ createdAt             │
│                     │         └──────────────────────┘
│                     │
│                     │──1:N──> ┌──────────────────────┐
│                     │         │   Deployment         │
│                     │         │──────────────────────│
│                     │         │ id (PK)              │
│                     │         │ projectId (FK)       │
│                     │         │ platform (enum)      │
│                     │         │ status (enum)        │
│                     │         │ url                  │
│                     │         │ vercelDeployId       │
│                     │         │ createdAt             │
│                     │         │ updatedAt             │
│                     │         └──────────────────────┘
│                     │
│                     │──1:N──> ┌──────────────────────┐
│                              │   ProjectEvent       │
│                              │──────────────────────│
│                              │ id (PK)              │
│                              │ projectId (FK)       │
│                              │ eventType (enum)     │
│                              │ payload (JSONB)      │
│                              │ createdAt             │
│                              └──────────────────────┘
```

---

## 3. Table Definitions

### 3.1 `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| name | VARCHAR(255) | NOT NULL | Display name |
| passwordHash | VARCHAR(255) | NOT NULL | bcrypt hash |
| avatarUrl | VARCHAR(512) | NULLABLE | Profile image URL |
| role | user_role | NOT NULL, DEFAULT 'member' | System role |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Account active flag |
| lastLoginAt | TIMESTAMPTZ | NULLABLE | Last login timestamp |
| createdAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |
| deletedAt | TIMESTAMPTZ | NULLABLE | Soft delete timestamp |

**Indexes**: `users_email_idx` UNIQUE on email; `users_role_idx` on role.

### 3.2 `teams`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Team name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| ownerId | UUID | FK -> users.id | Team owner |
| createdAt | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| deletedAt | TIMESTAMPTZ | NULLABLE | Soft delete |

**Indexes**: `teams_slug_idx` UNIQUE.

### 3.3 `memberships`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK -> users.id, NOT NULL | Member user |
| teamId | UUID | FK -> teams.id, NOT NULL | Team |
| role | membership_role | NOT NULL, DEFAULT 'member' | Team role |
| joinedAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Join timestamp |

**Indexes**: `memberships_user_team_idx` UNIQUE (userId, teamId); `memberships_team_idx` on teamId.

### 3.4 `projects`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK -> users.id, NOT NULL | Creator |
| teamId | UUID | FK -> teams.id, NULLABLE | Team scope |
| title | VARCHAR(255) | NOT NULL | Project title |
| description | TEXT | NOT NULL | User's natural language description |
| techStack | JSONB | NOT NULL, DEFAULT '[]' | Preferred technologies |
| status | project_status | NOT NULL, DEFAULT 'draft' | Current lifecycle status |
| currentPhase | project_phase | NOT NULL, DEFAULT 'ideation' | Active pipeline phase |
| metadata | JSONB | NOT NULL, DEFAULT '{}' | Flexible metadata |
| createdAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |
| deletedAt | TIMESTAMPTZ | NULLABLE | Soft delete |

**Indexes**: `projects_user_idx` on userId; `projects_team_idx` on teamId; `projects_status_idx` on status; `projects_created_idx` on createdAt DESC.

### 3.5 `agent_outputs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK -> projects.id, NOT NULL | Parent project |
| agentType | agent_type | NOT NULL | Type of agent |
| phase | project_phase | NOT NULL | Pipeline phase |
| content | JSONB | NOT NULL | Structured agent output |
| status | agent_output_status | NOT NULL, DEFAULT 'pending' | Execution status |
| iterationCount | INTEGER | NOT NULL, DEFAULT 0 | Feedback loop counter |
| feedback | TEXT | NULLABLE | User feedback text |
| tokensUsed | INTEGER | NOT NULL, DEFAULT 0 | LLM tokens consumed |
| startedAt | TIMESTAMPTZ | NULLABLE | Execution start |
| completedAt | TIMESTAMPTZ | NULLABLE | Execution end |

**Indexes**: `agent_outputs_project_idx` on projectId; `agent_outputs_status_idx` on status; `agent_outputs_project_agent_idx` UNIQUE (projectId, agentType, iterationCount).

### 3.6 `approvals`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| agentOutputId | UUID | FK -> agent_outputs.id, NOT NULL | Approved/rejected output |
| userId | UUID | FK -> users.id, NOT NULL | Approver |
| decision | approval_decision | NOT NULL | approve / reject / request_changes |
| comment | TEXT | NULLABLE | Optional feedback |
| createdAt | TIMESTAMPTZ | NOT NULL | Decision timestamp |

**Indexes**: `approvals_output_idx` on agentOutputId; `approvals_user_idx` on userId.

### 3.7 `project_files`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK -> projects.id, NOT NULL | Parent project |
| filePath | VARCHAR(1024) | NOT NULL | Relative path in project |
| content | TEXT | NOT NULL | File contents |
| fileType | file_type | NOT NULL | Type classification |
| hash | VARCHAR(64) | NOT NULL | SHA256 content hash |
| createdAt | TIMESTAMPTZ | NOT NULL | Creation timestamp |

**Indexes**: `project_files_project_idx` on projectId; `project_files_path_idx` UNIQUE (projectId, filePath).

### 3.8 `deployments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK -> projects.id, NOT NULL | Parent project |
| platform | deploy_platform | NOT NULL | Deployment target |
| status | deploy_status | NOT NULL, DEFAULT 'pending' | Deployment state |
| url | VARCHAR(512) | NULLABLE | Deployed URL |
| vercelDeployId | VARCHAR(255) | NULLABLE | Vercel deployment ID |
| errorMessage | TEXT | NULLABLE | Failure details |
| createdAt | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMPTZ | NOT NULL | Last update |

**Indexes**: `deployments_project_idx` on projectId.

### 3.9 `project_events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| projectId | UUID | FK -> projects.id, NOT NULL | Parent project |
| eventType | event_type | NOT NULL | Event category |
| payload | JSONB | NOT NULL, DEFAULT '{}' | Event data |
| createdAt | TIMESTAMPTZ | NOT NULL | Event timestamp |

**Indexes**: `project_events_project_idx` on projectId; `project_events_type_idx` on eventType; `project_events_created_idx` on createdAt DESC.

---

## 4. Enum Definitions

### 4.1 `user_role`
```sql
CREATE TYPE user_role AS ENUM ('admin', 'member');
```

### 4.2 `membership_role`
```sql
CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'member', 'viewer');
```

### 4.3 `project_status`
```sql
CREATE TYPE project_status AS ENUM ('draft', 'running', 'awaiting_approval', 'completed', 'failed');
```

### 4.4 `project_phase`
```sql
CREATE TYPE project_phase AS ENUM (
  'ideation', 'planning', 'architecture', 'implementation',
  'testing', 'deployment', 'delivery'
);
```

### 4.5 `agent_type`
```sql
CREATE TYPE agent_type AS ENUM (
  'ceo', 'pm', 'architect', 'ui_designer', 'db_engineer',
  'backend_engineer', 'frontend_engineer', 'qa', 'devops', 'documentation'
);
```

### 4.6 `agent_output_status`
```sql
CREATE TYPE agent_output_status AS ENUM (
  'pending', 'running', 'awaiting_approval', 'approved',
  'rejected', 'completed', 'failed'
);
```

### 4.7 `approval_decision`
```sql
CREATE TYPE approval_decision AS ENUM ('approve', 'reject', 'request_changes');
```

### 4.8 `file_type`
```sql
CREATE TYPE file_type AS ENUM (
  'documentation', 'config', 'source_code', 'test', 'migration', 'seed', 'docker'
);
```

### 4.9 `deploy_platform`
```sql
CREATE TYPE deploy_platform AS ENUM ('vercel', 'docker', 'custom');
```

### 4.10 `deploy_status`
```sql
CREATE TYPE deploy_status AS ENUM ('pending', 'deploying', 'success', 'failed');
```

### 4.11 `event_type`
```sql
CREATE TYPE event_type AS ENUM (
  'project:created', 'project:updated', 'agent:started', 'agent:completed',
  'agent:failed', 'approval:created', 'approval:approved', 'approval:rejected',
  'file:generated', 'deployment:started', 'deployment:completed', 'deployment:failed'
);
```

---

## 5. Drizzle Schema Organization

### Directory Structure
```
backend/
  src/
    db/
      schema/
        index.ts          # Re-export all schemas
        users.ts          # Users table schema
        teams.ts          # Teams table schema
        memberships.ts    # Memberships table schema
        projects.ts       # Projects table schema
        agent-outputs.ts  # Agent outputs table schema
        approvals.ts      # Approvals table schema
        project-files.ts  # Project files table schema
        deployments.ts    # Deployments table schema
        project-events.ts # Project events table schema
        enums.ts          # All enum definitions
      migrations/         # Auto-generated by Drizzle Kit
      seed/               # Seed scripts
        seed.ts
      index.ts            # DB connection and client export
```

### Connection Configuration
```typescript
// backend/src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

---

## 6. Migration Strategy

### 6.1 Tooling
- **Drizzle Kit** for migration generation and application
- All migrations stored in `backend/src/db/migrations/`
- Migration files are SQL (not TypeScript) for portability

### 6.2 Commands
```bash
# Generate migration after schema changes
npx drizzle-kit generate

# Apply migrations to local/dev database
npx drizzle-kit migrate

# Open Drizzle Studio for data browsing
npx drizzle-kit studio
```

### 6.3 Branching Strategy (Neon)
- **main** branch: Production database
- **dev** branch: Development and testing
- **Preview branches**: Created per feature branch for isolated testing
- Neon branching allows instant database cloning for parallel development

---

## 7. Indexing Strategy

| Table | Index | Type | Rationale |
|-------|-------|------|-----------|
| users | email | UNIQUE B-tree | Login lookup by email |
| projects | user_id + status | Composite B-tree | Dashboard query filtering |
| projects | created_at | B-tree DESC | Recent projects listing |
| agent_outputs | project_id + agent_type | Composite B-tree | Pipeline status queries |
| project_files | project_id + file_path | UNIQUE Composite | File lookup by path |
| project_events | project_id + created_at | Composite DESC | Event timeline queries |

---

## 8. Query Patterns

### 8.1 Create Project
```typescript
await db.insert(projects).values({
  userId,
  title,
  description,
  techStack,
  status: 'draft',
  currentPhase: 'ideation'
}).returning();
```

### 8.2 Get Project with Latest Agent Outputs
```typescript
await db.query.projects.findFirst({
  where: eq(projects.id, projectId),
  with: {
    agentOutputs: {
      orderBy: [desc(agentOutputs.createdAt)],
      limit: 1,
      where: eq(agentOutputs.agentType, agentType)
    }
  }
});
```

### 8.3 Insert Agent Output and Update Project Status (Transaction)
```typescript
await db.transaction(async (tx) => {
  await tx.insert(agentOutputs).values({ ... });
  await tx.update(projects)
    .set({ status: 'awaiting_approval' })
    .where(eq(projects.id, projectId));
});
```

---

## 9. Seed Data

### Test User
```typescript
// backend/src/db/seed/seed.ts
const seed = async () => {
  await db.insert(users).values({
    email: 'demo@aisoftco.com',
    name: 'Demo User',
    passwordHash: await bcrypt.hash('Demo@123', 12),
    role: 'member'
  });
};
```

---

## 10. Database Security

| Measure | Implementation |
|---------|----------------|
| Connection encryption | Neon TLS enforced |
| Least privilege | Separate DB users for read/write vs migration |
| Row-level security | Future: RLS policies per team |
| Audit logging | project_events table tracks all changes |
| Backup | Daily automated backups via Neon |
| PITR | Point-in-time recovery with 7-day retention |
