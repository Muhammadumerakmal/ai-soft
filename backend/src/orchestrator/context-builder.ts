import type { AgentType } from '@aisoftco/shared';
import { and, asc, desc, eq, lt } from 'drizzle-orm';

import type { PipelineContext } from '../agents/types';
import { db } from '../config/database';
import { workflowSteps, agentOutputs, projects } from '../db/schema';

export async function buildContext(
  workflowId: string,
  projectId: string,
  currentStepNumber: number
): Promise<PipelineContext> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) {
    throw new Error(`Project ${projectId} not found while building agent context`);
  }

  const priorSteps = await db
    .select()
    .from(workflowSteps)
    .where(
      and(
        eq(workflowSteps.workflowId, workflowId),
        lt(workflowSteps.stepNumber, currentStepNumber),
        eq(workflowSteps.status, 'completed')
      )
    )
    .orderBy(asc(workflowSteps.stepNumber));

  const priorOutputs = priorSteps
    .filter((step) => step.output)
    .map((step) => ({
      agentType: step.agentType as AgentType,
      output: step.output as Record<string, unknown>,
    }));

  const [currentStep] = await db
    .select()
    .from(workflowSteps)
    .where(
      and(eq(workflowSteps.workflowId, workflowId), eq(workflowSteps.stepNumber, currentStepNumber))
    );

  let feedback: PipelineContext['feedback'];
  if (currentStep) {
    const [rejection] = await db
      .select()
      .from(agentOutputs)
      .where(and(eq(agentOutputs.workflowStepId, currentStep.id), eq(agentOutputs.isApproved, false)))
      .orderBy(desc(agentOutputs.createdAt))
      .limit(1);

    if (rejection?.approvalComment) {
      feedback = { comment: rejection.approvalComment, previousOutput: rejection.output };
    }
  }

  return {
    project: { title: project.title, description: project.description, techStack: project.techStack },
    priorOutputs,
    feedback,
  };
}
