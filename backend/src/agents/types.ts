import type { ZodTypeAny } from 'zod';
import type { AgentType } from '@aisoftco/shared';

export interface PipelineContext {
  project: { title: string; description: string; techStack: string[] };
  priorOutputs: Array<{ agentType: AgentType; output: Record<string, unknown> }>;
  feedback?: { comment: string; previousOutput: Record<string, unknown> };
}

export interface AgentDefinition {
  type: AgentType;
  systemPrompt: string;
  schema: ZodTypeAny;
  buildUserMessage(context: PipelineContext): string;
}

export function formatPriorOutputs(context: PipelineContext): string {
  if (context.priorOutputs.length === 0) return '';
  return context.priorOutputs
    .map((entry) => `### ${entry.agentType.toUpperCase()} OUTPUT\n${JSON.stringify(entry.output, null, 2)}`)
    .join('\n\n');
}

export function formatFeedback(context: PipelineContext): string {
  if (!context.feedback) return '';
  return `\n\nYour previous output was rejected with this feedback: "${context.feedback.comment}"\nPrevious output:\n${JSON.stringify(context.feedback.previousOutput, null, 2)}\n\nRevise your output to address this feedback.`;
}
