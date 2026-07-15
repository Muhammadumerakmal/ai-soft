import type { AgentType } from '@aisoftco/shared';
import { and, desc, eq } from 'drizzle-orm';

import { db } from '../config/database';
import { projects, workflows, workflowSteps, agentOutputs } from '../db/schema';

import { readFile } from './tools/filesystem';
import type { McpResource } from './types';

export interface ResourceContent extends McpResource {
  text: string;
}

// ---------------------------------------------------------------------------
// project://<projectId>/context
// ---------------------------------------------------------------------------

export async function getProjectContextResource(projectId: string): Promise<ResourceContent> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const payload = {
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    status: project.status,
  };

  return {
    uri: `project://${projectId}/context`,
    name: `Project context: ${project.title}`,
    description: 'Title, description, tech stack, and status for the project',
    mimeType: 'application/json',
    text: JSON.stringify(payload, null, 2),
  };
}

// ---------------------------------------------------------------------------
// file://<projectId>/<path>
// ---------------------------------------------------------------------------

export async function getFileResource(projectId: string, filePath: string): Promise<ResourceContent> {
  const file = await readFile({ projectId, path: filePath });

  return {
    uri: `file://${projectId}/${filePath}`,
    name: filePath,
    description: `File contents for ${filePath} in project ${projectId}`,
    mimeType: 'text/plain',
    text: file.content,
  };
}

// ---------------------------------------------------------------------------
// agent-output://<projectId>[/<agentType>]
// ---------------------------------------------------------------------------

export async function getAgentOutputResource(
  projectId: string,
  agentType?: AgentType
): Promise<ResourceContent> {
  const conditions = [eq(workflows.projectId, projectId), eq(workflowSteps.status, 'completed')];
  if (agentType) {
    conditions.push(eq(workflowSteps.agentType, agentType));
  }

  const rows = await db
    .select({
      agentType: workflowSteps.agentType,
      output: agentOutputs.output,
      completedAt: workflowSteps.completedAt,
    })
    .from(workflowSteps)
    .innerJoin(workflows, eq(workflowSteps.workflowId, workflows.id))
    .innerJoin(agentOutputs, eq(agentOutputs.workflowStepId, workflowSteps.id))
    .where(and(...conditions))
    .orderBy(desc(workflowSteps.completedAt));

  // Keep only the most recent output per agent type (rows are already
  // ordered newest-first).
  const latestByAgent = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latestByAgent.has(row.agentType)) {
      latestByAgent.set(row.agentType, row);
    }
  }

  const outputs = Array.from(latestByAgent.values()).map((row) => ({
    agentType: row.agentType,
    completedAt: row.completedAt,
    output: row.output,
  }));

  return {
    uri: `agent-output://${projectId}/${agentType ?? 'latest'}`,
    name: agentType ? `Latest ${agentType} output` : 'Latest completed agent outputs',
    description: `Most recent completed agent output(s) for project ${projectId}`,
    mimeType: 'application/json',
    text: JSON.stringify(outputs, null, 2),
  };
}
