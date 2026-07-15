import type { GeneratedFilesOutput, TeamRole } from '@aisoftco/shared';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { PIPELINE_STAGES } from '../agents';
import { db } from '../config/database';
import { workflows, workflowSteps, agentOutputs, projects } from '../db/schema';
import { CodegenService } from '../services/codegen.service';
import { DocumentService } from '../services/document.service';
import { assertProjectAccess } from '../services/project-access';
import { NotFoundError, ValidationError } from '../utils/errors';

import { broadcastWorkflowState } from './broadcast';
import { enqueueStep } from './pipeline';



const MAX_FEEDBACK_ITERATIONS = 3;
const DOCUMENT_AGENT_TYPES = new Set(['ceo', 'pm', 'architect']);
const documentService = new DocumentService();
const codegenService = new CodegenService();

export class OrchestratorService {
  async startWorkflow(projectId: string) {
    const [workflow] = await db
      .insert(workflows)
      .values({ projectId, status: 'pending', totalSteps: PIPELINE_STAGES.length })
      .returning();

    if (!workflow) throw new Error('Failed to create workflow');

    const stepRows = PIPELINE_STAGES.flatMap((stageAgentTypes, index) =>
      stageAgentTypes.map((agentType) => ({
        workflowId: workflow.id,
        agentType,
        stepNumber: index + 1,
        status: 'pending' as const,
      }))
    );

    const steps = await db.insert(workflowSteps).values(stepRows).returning();
    const firstStageSteps = steps.filter((s) => s.stepNumber === 1);
    if (firstStageSteps.length === 0) throw new Error('Failed to create workflow steps');

    await db
      .update(workflows)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(workflows.id, workflow.id));
    await db.update(projects).set({ status: 'running' }).where(eq(projects.id, projectId));

    for (const step of firstStageSteps) {
      await enqueueStep(step.id);
    }

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

  private async getAwaitingStage(userId: string, projectId: string) {
    const { workflow, steps } = await this.getWorkflowByProject(userId, projectId, 'editor');
    if (workflow.status !== 'awaiting_approval') {
      throw new ValidationError([{ message: 'Workflow is not currently awaiting approval' }]);
    }
    const stage = steps.filter((s) => s.status === 'awaiting_approval');
    if (stage.length === 0) throw new NotFoundError('Awaiting-approval workflow step');
    return { workflow, stage };
  }

  async approve(userId: string, projectId: string, comment?: string) {
    const { workflow, stage } = await this.getAwaitingStage(userId, projectId);

    for (const step of stage) {
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
        if (DOCUMENT_AGENT_TYPES.has(step.agentType)) {
          await documentService.generate(workflow.projectId, step.agentType, step.output as Record<string, unknown>);
        } else {
          await codegenService.writeGeneratedFiles(
            workflow.projectId,
            step.agentType,
            step.output as unknown as GeneratedFilesOutput
          );
        }
      }
    }

    const currentStepNumber = stage[0]!.stepNumber;
    const nextStepNumber = currentStepNumber + 1;
    if (nextStepNumber > (workflow.totalSteps ?? PIPELINE_STAGES.length)) {
      await db
        .update(workflows)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(workflows.id, workflow.id));
      await db.update(projects).set({ status: 'completed' }).where(eq(projects.id, workflow.projectId));
      await broadcastWorkflowState(workflow.id);
      return { workflowStatus: 'completed' as const };
    }

    const nextSteps = await db
      .select()
      .from(workflowSteps)
      .where(and(eq(workflowSteps.workflowId, workflow.id), eq(workflowSteps.stepNumber, nextStepNumber)));
    if (nextSteps.length === 0) throw new Error('Next workflow step not found');

    await db.update(workflows).set({ status: 'running' }).where(eq(workflows.id, workflow.id));
    await broadcastWorkflowState(workflow.id);

    for (const nextStep of nextSteps) {
      await enqueueStep(nextStep.id);
    }

    return { workflowStatus: 'running' as const };
  }

  async reject(userId: string, projectId: string, comment: string) {
    const { workflow, stage } = await this.getAwaitingStage(userId, projectId);

    let exceededLimit = false;

    for (const step of stage) {
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
        exceededLimit = true;
        await db
          .update(workflowSteps)
          .set({ status: 'failed', errorMessage: 'Max feedback iterations exceeded', retryCount })
          .where(eq(workflowSteps.id, step.id));
      } else {
        await db
          .update(workflowSteps)
          .set({ status: 'pending', retryCount })
          .where(eq(workflowSteps.id, step.id));
      }
    }

    if (exceededLimit) {
      await db.update(workflows).set({ status: 'failed' }).where(eq(workflows.id, workflow.id));
      await db.update(projects).set({ status: 'failed' }).where(eq(projects.id, workflow.projectId));
      await broadcastWorkflowState(workflow.id);
      return { workflowStatus: 'failed' as const };
    }

    await db.update(workflows).set({ status: 'running' }).where(eq(workflows.id, workflow.id));
    await broadcastWorkflowState(workflow.id);

    for (const step of stage) {
      await enqueueStep(step.id);
    }

    return { workflowStatus: 'running' as const };
  }
}
