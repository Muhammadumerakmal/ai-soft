# Database Architecture

## Technology

- **Primary:** Neon PostgreSQL 16 (serverless, auto-scaling)
- **ORM:** Drizzle ORM (type-safe SQL query builder)
- **Cache/Queue:** Redis via Upstash

## Design Principles

- Schema-first design with Drizzle
- UUID primary keys on all tables
- Soft deletes (`deletedAt` timestamp)
- Created/updated timestamps on all tables
- Foreign keys with proper indexes
- JSONB for flexible metadata
- Enum types for status fields

## Entity Relationship Diagram

```
User (1) ──> (N) Project
User (N) <──> (N) Team (via Membership)
Team (1) ──> (N) Project
Project (1) ──> (N) AgentOutput
Project (1) ──> (N) ProjectFile
Project (1) ──> (N) Deployment
Project (1) ──> (N) ProjectEvent
AgentOutput (1) ──> (N) Approval
```

## Table Definitions

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| passwordHash | VARCHAR(255) | NOT NULL |
| avatarUrl | VARCHAR(512) | NULLABLE |
| role | user_role | NOT NULL, DEFAULT 'member' |
| isActive | BOOLEAN | NOT NULL, DEFAULT true |
| lastLoginAt | TIMESTAMPTZ | NULLABLE |
| createdAt | TIMESTAMPTZ | NOT NULL |
| updatedAt | TIMESTAMPTZ | NOT NULL |
| deletedAt | TIMESTAMPTZ | NULLABLE |

### teams
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | UNIQUE, NOT NULL |
| ownerId | UUID | FK → users.id |
| createdAt | TIMESTAMPTZ | NOT NULL |
| updatedAt | TIMESTAMPTZ | NOT NULL |
| deletedAt | TIMESTAMPTZ | NULLABLE |

### memberships
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| userId | UUID | FK → users.id |
| teamId | UUID | FK → teams.id |
| role | membership_role | NOT NULL |
| joinedAt | TIMESTAMPTZ | NOT NULL |
| UNIQUE(userId, teamId) | | |

### projects
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| userId | UUID | FK → users.id |
| teamId | UUID | FK → teams.id, NULLABLE |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| techStack | JSONB | NOT NULL |
| status | project_status | NOT NULL |
| currentPhase | project_phase | NOT NULL |
| metadata | JSONB | NOT NULL |
| createdAt | TIMESTAMPTZ | NOT NULL |
| updatedAt | TIMESTAMPTZ | NOT NULL |
| deletedAt | TIMESTAMPTZ | NULLABLE |

### agent_outputs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| projectId | UUID | FK → projects.id |
| agentType | agent_type | NOT NULL |
| phase | project_phase | NOT NULL |
| content | JSONB | NOT NULL |
| status | agent_output_status | NOT NULL |
| iterationCount | INTEGER | NOT NULL, DEFAULT 0 |
| feedback | TEXT | NULLABLE |
| tokensUsed | INTEGER | NOT NULL, DEFAULT 0 |
| startedAt | TIMESTAMPTZ | NULLABLE |
| completedAt | TIMESTAMPTZ | NULLABLE |

### approvals
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| agentOutputId | UUID | FK → agent_outputs.id |
| userId | UUID | FK → users.id |
| decision | approval_decision | NOT NULL |
| comment | TEXT | NULLABLE |
| createdAt | TIMESTAMPTZ | NOT NULL |

### project_files
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| projectId | UUID | FK → projects.id |
| filePath | VARCHAR(1024) | NOT NULL |
| content | TEXT | NOT NULL |
| fileType | file_type | NOT NULL |
| hash | VARCHAR(64) | NOT NULL |
| createdAt | TIMESTAMPTZ | NOT NULL |
| UNIQUE(projectId, filePath) | | |

### deployments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| projectId | UUID | FK → projects.id |
| platform | deploy_platform | NOT NULL |
| status | deploy_status | NOT NULL |
| url | VARCHAR(512) | NULLABLE |
| vercelDeployId | VARCHAR(255) | NULLABLE |
| errorMessage | TEXT | NULLABLE |
| createdAt | TIMESTAMPTZ | NOT NULL |
| updatedAt | TIMESTAMPTZ | NOT NULL |

### project_events
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| projectId | UUID | FK → projects.id |
| eventType | event_type | NOT NULL |
| payload | JSONB | NOT NULL |
| createdAt | TIMESTAMPTZ | NOT NULL |

## Enums

```sql
user_role: admin, member
membership_role: owner, admin, member, viewer
project_status: draft, running, awaiting_approval, completed, failed
project_phase: ideation, planning, architecture, implementation, testing, deployment, delivery
agent_type: ceo, pm, architect, ui_designer, db_engineer, backend_engineer, frontend_engineer, qa, devops, documentation
agent_output_status: pending, running, awaiting_approval, approved, rejected, completed, failed
approval_decision: approve, reject, request_changes
file_type: documentation, config, source_code, test, migration, seed, docker
deploy_platform: vercel, docker, custom
deploy_status: pending, deploying, success, failed
event_type: project:created, project:updated, agent:started, agent:completed, agent:failed, approval:created, approval:approved, approval:rejected, file:generated, deployment:started, deployment:completed, deployment:failed
```

## Indexing Strategy

```sql
CREATE INDEX idx_projects_user_status ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_created_desc ON projects(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_agent_outputs_project ON agent_outputs(project_id, agent_type, iteration_count);
CREATE INDEX idx_agent_outputs_status ON agent_outputs(status);
CREATE INDEX idx_project_files_path ON project_files(project_id, file_path);
CREATE INDEX idx_project_events_timeline ON project_events(project_id, created_at DESC);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_team ON memberships(team_id);
```

## Migration Strategy

- Drizzle Kit for migration generation and application
- All migrations stored as SQL files
- Neon branching: main (prod), dev, preview branches per feature

## Schema Organisation

```
backend/src/db/
  index.ts           # Drizzle client export
  enums.ts           # All enum type definitions
  schema/
    index.ts         # Re-exports
    users.ts
    teams.ts
    memberships.ts
    projects.ts
    agent-outputs.ts
    approvals.ts
    project-files.ts
    deployments.ts
    project-events.ts
  migrations/        # Generated by Drizzle Kit
  seed/seed.ts       # Seed script
```

## Neon PostgreSQL Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Engine | PostgreSQL 16 | Latest stable |
| Compute | Auto-scaling (0.25–4 vCPU) | Match demand |
| Connection pooler | pgBouncer (transaction) | 1000+ concurrent |
| Backup | Daily + PITR 7-day | RPO < 1 hour |
| Branches | main, dev, preview per PR | Isolated dev |
