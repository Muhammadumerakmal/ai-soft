import { eq } from 'drizzle-orm';
import type OpenAI from 'openai';
import zodToJsonSchema from 'zod-to-json-schema';

import { getAgentDefinition } from '../agents';
import { env } from '../config';
import { db } from '../config/database';
import { openai } from '../config/openai';
import { workflowSteps, workflows, aiAgents, agentExecutions, agentOutputs, projects } from '../db/schema';
import { McpClient } from '../mcp/client';
import { AGENT_TOOL_ACL } from '../mcp/registry';
import { logger } from '../utils/logger';

import { broadcastWorkflowState } from './broadcast';
import { buildContext } from './context-builder';

const MAX_MODEL_ATTEMPTS = 3;
const MAX_TOOL_ITERATIONS = 4;
const TOOL_PHASE_MAX_TOKENS = 2048;
const TOOL_RESULT_CHAR_LIMIT = 4000;

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

function getMcpClient(): McpClient | null {
  if (!env.MCP_API_KEY) return null;
  return new McpClient(`http://localhost:${env.MCP_PORT}/mcp/v1`, env.MCP_API_KEY);
}

/**
 * Lets tool-enabled agents inspect the project sandbox (prior stages' generated
 * files, lint/typecheck results, Context7 docs) before producing their final
 * structured output. Bounded to MAX_TOOL_ITERATIONS turns. Every failure mode
 * here — MCP server down, model doesn't support tool calling, malformed
 * tool_calls — is caught by the caller and treated as "no tool context available"
 * rather than failing the step, per the graceful-fallback requirement in
 * .specs/phases/phase-04.md.
 */
async function runToolPhase(
  mcpClient: McpClient,
  allowedToolNames: string[],
  agentConfig: typeof aiAgents.$inferSelect,
  systemPrompt: string,
  userMessage: string,
  projectId: string
): Promise<string> {
  const tools = await mcpClient.listTools();
  const availableTools = tools.filter((tool) => allowedToolNames.includes(tool.name));
  if (availableTools.length === 0) return '';

  const openaiTools: OpenAI.Chat.ChatCompletionTool[] = availableTools.map((tool) => ({
    type: 'function',
    function: { name: tool.name, description: tool.description, parameters: tool.inputSchema as Record<string, unknown> },
  }));

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content:
        `${userMessage}\n\nYou may use the available tools to inspect the project sandbox before answering ` +
        `(every tool call needs "projectId": "${projectId}"). When you're done — or if the tools aren't useful ` +
        `here — reply with a short plain-text summary of what you learned. Do not produce your final structured ` +
        `output in this message; that happens in a separate step.`,
    },
  ];

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const completion = await openai.chat.completions.create({
      model: agentConfig.model,
      temperature: agentConfig.temperature ?? 0.3,
      max_tokens: TOOL_PHASE_MAX_TOKENS,
      messages,
      tools: openaiTools,
    });

    const message = completion.choices[0]?.message;
    if (!message) break;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return typeof message.content === 'string' ? message.content : '';
    }

    for (const call of message.tool_calls) {
      let resultText: string;
      try {
        const args = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>;
        const result = await mcpClient.callTool(call.function.name, { projectId, ...args });
        resultText = JSON.stringify(result);
      } catch (error) {
        resultText = JSON.stringify({ error: error instanceof Error ? error.message : 'Tool call failed' });
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: resultText.slice(0, TOOL_RESULT_CHAR_LIMIT),
      });
    }
  }

  return 'Tool investigation reached the iteration limit before finishing.';
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
  const systemPrompt = agentConfig.systemPrompt || definition.systemPrompt;
  const baseUserMessage = definition.buildUserMessage(context);

  let toolContextSummary = '';
  const allowedTools = AGENT_TOOL_ACL[step.agentType] ?? [];
  const mcpClient = allowedTools.length > 0 ? getMcpClient() : null;
  if (mcpClient) {
    try {
      toolContextSummary = await runToolPhase(
        mcpClient,
        allowedTools,
        agentConfig,
        systemPrompt,
        baseUserMessage,
        workflow.projectId
      );
    } catch (error) {
      logger.warn({ error, agentType: step.agentType }, 'MCP tool phase unavailable — continuing without tool context');
    }
  }

  const userMessage = toolContextSummary
    ? `${baseUserMessage}\n\nTool investigation summary:\n${toolContextSummary}`
    : baseUserMessage;

  const start = Date.now();
  let parsed: Record<string, unknown> | null = null;
  let usage: OpenAI.Chat.ChatCompletion['usage'];
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_MODEL_ATTEMPTS; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: agentConfig.model,
        temperature: agentConfig.temperature ?? 0.3,
        max_tokens: agentConfig.maxTokens ?? 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'agent_output', schema: jsonSchema, strict: true },
        },
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error('Empty response from model');

      parsed = definition.schema.parse(stripNulls(JSON.parse(raw))) as Record<string, unknown>;
      usage = completion.usage;
      break;
    } catch (error) {
      lastError = error;
      logger.warn(
        { error, attempt, maxAttempts: MAX_MODEL_ATTEMPTS, agentType: step.agentType },
        'Agent model call failed — retrying if attempts remain'
      );
    }
  }

  try {
    if (!parsed) throw lastError ?? new Error('Agent produced no output');

    const durationMs = Date.now() - start;

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
