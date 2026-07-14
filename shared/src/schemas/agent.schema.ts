import { z } from 'zod';

export const AGENT_TYPES = [
  'ceo',
  'pm',
  'architect',
  'ui_designer',
  'db_engineer',
  'backend_engineer',
  'frontend_engineer',
  'qa',
  'security',
  'devops',
  'documentation',
] as const;

export type AgentType = (typeof AGENT_TYPES)[number];

export const AGENT_STATUSES = [
  'pending',
  'running',
  'completed',
  'failed',
  'awaiting_approval',
] as const;

export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const WORKFLOW_STATUSES = [
  'pending',
  'running',
  'completed',
  'failed',
  'awaiting_approval',
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const ceoOutputSchema = z.object({
  vision: z.string().describe('One-sentence product vision'),
  scope: z.string().describe('Project scope and boundaries'),
  targetAudience: z.array(z.string()).describe('Primary user personas'),
  successCriteria: z.array(z.string()).describe('How project success is measured'),
  techStack: z.array(z.string()).describe('Recommended technologies'),
  constraints: z.array(z.string()).optional().describe('Known constraints and limitations'),
  clarifyingQuestions: z.array(z.string()).optional().describe('Questions for the user'),
});

export type CEOOutput = z.infer<typeof ceoOutputSchema>;

export const userStorySchema = z.object({
  title: z.string(),
  asA: z.string().describe('User persona'),
  iWant: z.string().describe('Desired capability'),
  soThat: z.string().describe('Business value'),
  acceptanceCriteria: z.array(z.string()),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export type UserStory = z.infer<typeof userStorySchema>;

export const pmOutputSchema = z.object({
  productOverview: z.string(),
  targetPersonas: z.array(z.string()),
  userStories: z.array(userStorySchema),
  featureList: z.array(z.string()),
  nonFunctionalRequirements: z.array(z.string()).optional(),
  outOfScope: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
});

export type PMOutput = z.infer<typeof pmOutputSchema>;

export const architectureComponentSchema = z.object({
  name: z.string(),
  responsibility: z.string(),
  technology: z.string(),
});

export const architectOutputSchema = z.object({
  systemOverview: z.string(),
  architectureStyle: z.string().describe('e.g. monolith, microservices, modular monolith'),
  components: z.array(architectureComponentSchema),
  dataModel: z.array(
    z.object({
      entity: z.string(),
      fields: z.array(z.string()),
      relationships: z.array(z.string()).optional(),
    })
  ),
  apiEndpoints: z.array(
    z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      path: z.string(),
      description: z.string(),
    })
  ),
  techStack: z.array(z.string()),
  risks: z.array(z.string()).optional(),
});

export type ArchitectOutput = z.infer<typeof architectOutputSchema>;

export const approveStepSchema = z.object({
  comment: z.string().max(2000).optional(),
});
export type ApproveStepInput = z.infer<typeof approveStepSchema>;

export const rejectStepSchema = z.object({
  comment: z.string().min(1, 'Feedback comment is required').max(2000),
});
export type RejectStepInput = z.infer<typeof rejectStepSchema>;

export const agentOutputSchema = z.object({
  agentType: z.enum(AGENT_TYPES),
  output: z.record(z.unknown()),
  tokensUsed: z.number().int().positive(),
  durationMs: z.number().int().positive(),
});

export type AgentOutput = z.infer<typeof agentOutputSchema>;
