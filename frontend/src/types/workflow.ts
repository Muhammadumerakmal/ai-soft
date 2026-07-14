import type { AgentType, AgentStatus, WorkflowStatus } from '@aisoftco/shared';

export interface WorkflowStep {
  id: string;
  workflowId: string;
  agentType: AgentType;
  stepNumber: number;
  status: AgentStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

export interface Workflow {
  id: string;
  projectId: string;
  status: WorkflowStatus;
  currentAgentType: AgentType | null;
  currentStep: number;
  totalSteps: number;
  metadata: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowResponse {
  workflow: Workflow;
  steps: WorkflowStep[];
}
