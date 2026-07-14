import type { AgentType } from '../schemas/agent.schema';

export const AGENT_REGISTRY: Record<
  AgentType,
  {
    displayName: string;
    description: string;
    inputTokenBudget: number;
    outputTokenBudget: number;
  }
> = {
  ceo: { displayName: 'CEO Agent', description: 'Project vision and scope definition', inputTokenBudget: 4000, outputTokenBudget: 4000 },
  pm: { displayName: 'PM Agent', description: 'User stories and requirements', inputTokenBudget: 8000, outputTokenBudget: 8000 },
  architect: { displayName: 'Architect Agent', description: 'Technical architecture and API design', inputTokenBudget: 12000, outputTokenBudget: 12000 },
  ui_designer: { displayName: 'UI Designer Agent', description: 'Frontend component generation', inputTokenBudget: 8000, outputTokenBudget: 6000 },
  db_engineer: { displayName: 'DB Engineer Agent', description: 'Database schema and migration generation', inputTokenBudget: 8000, outputTokenBudget: 8000 },
  backend_engineer: { displayName: 'Backend Engineer Agent', description: 'API route and service generation', inputTokenBudget: 12000, outputTokenBudget: 16000 },
  frontend_engineer: { displayName: 'Frontend Engineer Agent', description: 'Page and component generation', inputTokenBudget: 12000, outputTokenBudget: 16000 },
  qa: { displayName: 'QA Engineer Agent', description: 'Test generation', inputTokenBudget: 16000, outputTokenBudget: 8000 },
  security: { displayName: 'Security Agent', description: 'Security review', inputTokenBudget: 12000, outputTokenBudget: 6000 },
  devops: { displayName: 'DevOps Agent', description: 'Infrastructure and CI/CD generation', inputTokenBudget: 16000, outputTokenBudget: 6000 },
  documentation: { displayName: 'Documentation Agent', description: 'Documentation generation', inputTokenBudget: 24000, outputTokenBudget: 8000 },
};
