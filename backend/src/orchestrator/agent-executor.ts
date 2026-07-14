import { eq } from 'drizzle-orm';
import zodToJsonSchema from 'zod-to-json-schema';
import { openai } from '../config/openai';
import { db } from '../config/database';
import { workflowSteps, workflows, aiAgents, agentExecutions, agentOutputs, projects } from '../db/schema';
import { getAgentDefinition } from '../agents';
import { buildContext } from './context-builder';
import { broadcastWorkflowState } from './broadcast';
import { logger } from '../utils/logger';

function stripNulls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripNulls(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry === null) continue;
      result[key] = stripNulls(entry);
    }
    return result as T;
  }
  return value;
}

export async function executeStep(workflowStepId: string) {
  const [step] = await db.select().from(workflowSteps).where(eq(workflowSteps.id, workflowStepId));
  if (!step) throw new Error(`Workflow step ${workflowStepId} not found`);

  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, step.workflowId));
  if (!workflow) throw new Error(`Workflow ${step.workflowId} not found`);

  const definition = getAgentDefinition(step.agentType);

  const [agentConfig] = await db.select().from(aiAgents).where(eq(aiAgents.agentType, step.agentType));
  if (!agentConfig) {
    throw new Error(`No ai_agents config seeded for type "${step.agentType}". Run "npm run db:seed".`);
  }

  await db
    .update(workflowSteps)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(workflowSteps.id, step.id));

  await db
    .update(workflows)
    .set({ status: 'running', currentAgentType: step.agentType, currentStep: step.stepNumber })
    .where(eq(workflows.id, workflow.id));

  await broadcastWorkflowState(workflow.id);

  const [execution] = await db
    .insert(agentExecutions)
    .values({ workflowStepId: step.id, agentId: agentConfig.id, status: 'running', startedAt: new Date() })
    .returning();

  if (!execution) throw new Error('Failed to create agent execution record');

  const context = await buildContext(workflow.id, workflow.projectId, step.stepNumber);
  const jsonSchema = zodToJsonSchema(definition.schema, { $refStrategy: 'none', target: 'openAi' });

  const start = Date.now();
  try {
    const completion = await openai.chat.completions.create({
      model: agentConfig.model,
      temperature: agentConfig.temperature ?? 0.3,
      max_tokens: agentConfig.maxTokens ?? 4096,
      messages: [
        { role: 'system', content: agentConfig.systemPrompt || definition.systemPrompt },
        { role: 'user', content: definition.buildUserMessage(context) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'agent_output', schema: jsonSchema, strict: true },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from model');

    const parsed = definition.schema.parse(stripNulls(JSON.parse(raw))) as Record<string, unknown>;
    const durationMs = Date.now() - start;
    const usage = completion.usage;

    await db
      .update(agentExecutions)
      .set({
        status: 'completed',
        inputTokens: usage?.prompt_tokens,
        outputTokens: usage?.completion_tokens,
        durationMs,
        completedAt: new Date(),
      })
      .where(eq(agentExecutions.id, execution.id));

    await db
      .insert(agentOutputs)
      .values({ workflowStepId: step.id, agentType: step.agentType, output: parsed, isValidated: true });

    await db
      .update(workflowSteps)
      .set({ status: 'awaiting_approval', output: parsed, completedAt: new Date() })
      .where(eq(workflowSteps.id, step.id));

    await db.update(workflows).set({ status: 'awaiting_approval' }).where(eq(workflows.id, workflow.id));

    await broadcastWorkflowState(workflow.id);

    return parsed;
  } catch (error) {
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error, workflowStepId }, 'Agent execution failed');

    await db
      .update(agentExecutions)
      .set({ status: 'failed', errorMessage: message, durationMs, completedAt: new Date() })
      .where(eq(agentExecutions.id, execution.id));

    await db
      .update(workflowSteps)
      .set({ status: 'failed', errorMessage: message })
      .where(eq(workflowSteps.id, step.id));

    await db.update(workflows).set({ status: 'failed' }).where(eq(workflows.id, workflow.id));
    await db.update(projects).set({ status: 'failed' }).where(eq(projects.id, workflow.projectId));

    await broadcastWorkflowState(workflow.id);

    throw error;
  }
}
