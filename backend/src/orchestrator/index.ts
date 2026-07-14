import { and, desc, eq, isNull } from 'drizzle-orm';
import type { TeamRole } from '@aisoftco/shared';
import { db } from '../config/database';
import { workflows, workflowSteps, agentOutputs, projects } from '../db/schema';
import { PIPELINE_ORDER } from '../agents';
import { enqueueStep } from './pipeline';
import { DocumentService } from '../services/document.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import { broadcastWorkflowState } from './broadcast';
import { assertProjectAccess } from '../services/project-access';

const MAX_FEEDBACK_ITERATIONS = 3;
const documentService = new DocumentService();

export class OrchestratorService {
  async startWorkflow(projectId: string) {
    const [workflow] = await db
      .insert(workflows)
      .values({ projectId, status: 'pending', totalSteps: PIPELINE_ORDER.length })
      .returning();

    if (!workflow) throw new Error('Failed to create workflow');

    const stepRows = PIPELINE_ORDER.map((agentType, index) => ({
      workflowId: workflow.id,
      agentType,
      stepNumber: index + 1,
      status: 'pending' as const,
    }));

    const steps = await db.insert(workflowSteps).values(stepRows).returning();
    const firstStep = steps.find((s) => s.stepNumber === 1);
    if (!firstStep) throw new Error('Failed to create workflow steps');

    await db
      .update(workflows)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(workflows.id, workflow.id));
    await db.update(projects).set({ status: 'running' }).where(eq(projects.id, projectId));

    await enqueueStep(firstStep.id);

    return workflow;
  }

  async getWorkflowByProject(userId: string, projectId: string, minRole: TeamRole = 'viewer') {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));
    if (!project) throw new NotFoundError('Project');

    await assertProjectAccess(userId, project, minRole);

    const [workflow] = await db.select().from(workflows).where(eq(workflows.projectId, projectId));
    if (!workflow) throw new NotFoundError('Workflow');

    const steps = await db
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.workflowId, workflow.id))
      .orderBy(workflowSteps.stepNumber);

    return { workflow, steps };
  }

  private async getAwaitingStep(userId: string, projectId: string) {
    const { workflow, steps } = await this.getWorkflowByProject(userId, projectId, 'editor');
    if (workflow.status !== 'awaiting_approval') {
      throw new ValidationError([{ message: 'Workflow is not currently awaiting approval' }]);
    }
    const step = steps.find((s) => s.status === 'awaiting_approval');
    if (!step) throw new NotFoundError('Awaiting-approval workflow step');
    return { workflow, step };
  }

  async approve(userId: string, projectId: string, comment?: string) {
    const { workflow, step } = await this.getAwaitingStep(userId, projectId);

    const [output] = await db
      .select()
      .from(agentOutputs)
      .where(eq(agentOutputs.workflowStepId, step.id))
      .orderBy(desc(agentOutputs.createdAt))
      .limit(1);

    if (output) {
      await db
        .update(agentOutputs)
        .set({ isApproved: true, approvalComment: comment, approvedAt: new Date() })
        .where(eq(agentOutputs.id, output.id));
    }

    await db.update(workflowSteps).set({ status: 'completed' }).where(eq(workflowSteps.id, step.id));

    if (step.output) {
      await documentService.generate(workflow.projectId, step.agentType, step.output as Record<string, unknown>);
    }

    const nextStepNumber = step.stepNumber + 1;
    if (nextStepNumber > (workflow.totalSteps ?? PIPELINE_ORDER.length)) {
      await db
        .update(workflows)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(workflows.id, workflow.id));
      await db.update(projects).set({ status: 'completed' }).where(eq(projects.id, workflow.projectId));
      await broadcastWorkflowState(workflow.id);
      return { workflowStatus: 'completed' as const };
    }

    const [nextStep] = await db
      .select()
      .from(workflowSteps)
      .where(and(eq(workflowSteps.workflowId, workflow.id), eq(workflowSteps.stepNumber, nextStepNumber)));
    if (!nextStep) throw new Error('Next workflow step not found');

    await db.update(workflows).set({ status: 'running' }).where(eq(workflows.id, workflow.id));
    await broadcastWorkflowState(workflow.id);
    await enqueueStep(nextStep.id);

    return { workflowStatus: 'running' as const };
  }

  async reject(userId: string, projectId: string, comment: string) {
    const { workflow, step } = await this.getAwaitingStep(userId, projectId);

    const [output] = await db
      .select()
      .from(agentOutputs)
      .where(eq(agentOutputs.workflowStepId, step.id))
      .orderBy(desc(agentOutputs.createdAt))
      .limit(1);

    if (output) {
      await db
        .update(agentOutputs)
        .set({ isApproved: false, approvalComment: comment })
        .where(eq(agentOutputs.id, output.id));
    }

    const retryCount = (step.retryCount ?? 0) + 1;
    if (retryCount > MAX_FEEDBACK_ITERATIONS) {
      await db
        .update(workflowSteps)
        .set({ status: 'failed', errorMessage: 'Max feedback iterations exceeded', retryCount })
        .where(eq(workflowSteps.id, step.id));
      await db.update(workflows).set({ status: 'failed' }).where(eq(workflows.id, workflow.id));
      await db.update(projects).set({ status: 'failed' }).where(eq(projects.id, workflow.projectId));
      await broadcastWorkflowState(workflow.id);
      return { workflowStatus: 'failed' as const };
    }

    await db.update(workflowSteps).set({ status: 'pending', retryCount }).where(eq(workflowSteps.id, step.id));
    await db.update(workflows).set({ status: 'running' }).where(eq(workflows.id, workflow.id));
    await broadcastWorkflowState(workflow.id);

    await enqueueStep(step.id);

    return { workflowStatus: 'running' as const };
  }
}
