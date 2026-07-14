import { eq, asc } from 'drizzle-orm';
import { db } from '../config/database';
import { workflows, workflowSteps } from '../db/schema';
import { emitToProject } from '../ws/socket-server';

export async function broadcastWorkflowState(workflowId: string) {
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId));
  if (!workflow) return;

  const steps = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, workflowId))
    .orderBy(asc(workflowSteps.stepNumber));

  emitToProject(workflow.projectId, 'workflow:update', { workflow, steps });
}
