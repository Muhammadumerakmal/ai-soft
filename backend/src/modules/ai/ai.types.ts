import type { z } from 'zod';

export interface AgentConfig {
  name: string;
  instructions: string;
  model?: string;
  handoffDescription?: string;
}

export interface AgentRunOptions {
  agentName: string;
  input: string;
}

export interface AgentRunResult {
  output: string;
  agentName: string;
}

export const AgentName = {
  CEO: 'ceo',
  PRODUCT_MANAGER: 'pm',
  BUSINESS_ANALYST: 'ba',
  ARCHITECT: 'architect',
  FRONTEND_DEVELOPER: 'frontend',
  BACKEND_DEVELOPER: 'backend',
  DATABASE_DEVELOPER: 'database',
  QA_ENGINEER: 'qa',
  SECURITY_ENGINEER: 'security',
  DOCUMENTATION_WRITER: 'docs',
} as const;

export type AgentName = (typeof AgentName)[keyof typeof AgentName];

export type ToolHandler<TInput = unknown, TOutput = unknown> = (input: TInput) => Promise<TOutput>;

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  schema: z.ZodType<TInput>;
  handler: ToolHandler<TInput, TOutput>;
}
