import type { Agent } from '@openai/agents';
import { Runner } from '@openai/agents';
import type { AgentConfig, AgentRunOptions, AgentRunResult } from './ai.types.js';
import { AgentName } from './ai.types.js';
import {
  ceo,
  productManager,
  businessAnalyst,
  architect,
  frontendDeveloper,
  backendDeveloper,
  databaseDeveloper,
  qaEngineer,
  securityEngineer,
  documentationWriter,
} from './agents.js';
import { getModelProvider, getDefaultModel } from './openrouter.js';

const agentDefinitions: Record<string, AgentConfig> = {
  [AgentName.CEO]: {
    name: 'CEO',
    instructions: 'CEO who analyzes ideas and delegates to product team.',
    handoffDescription: 'CEO agent',
  },
  [AgentName.PRODUCT_MANAGER]: {
    name: 'Product Manager',
    instructions: 'Defines requirements and user stories.',
    handoffDescription: 'Product Manager agent',
  },
  [AgentName.BUSINESS_ANALYST]: {
    name: 'Business Analyst',
    instructions: 'Creates functional specifications.',
    handoffDescription: 'Business Analyst agent',
  },
  [AgentName.ARCHITECT]: {
    name: 'Software Architect',
    instructions: 'Designs system architecture.',
    handoffDescription: 'Software Architect agent',
  },
  [AgentName.FRONTEND_DEVELOPER]: {
    name: 'Frontend Developer',
    instructions: 'Plans frontend implementation.',
    handoffDescription: 'Frontend Developer agent',
  },
  [AgentName.BACKEND_DEVELOPER]: {
    name: 'Backend Developer',
    instructions: 'Plans backend implementation.',
    handoffDescription: 'Backend Developer agent',
  },
  [AgentName.DATABASE_DEVELOPER]: {
    name: 'Database Developer',
    instructions: 'Designs database schema.',
    handoffDescription: 'Database Developer agent',
  },
  [AgentName.QA_ENGINEER]: {
    name: 'QA Engineer',
    instructions: 'Creates test plans.',
    handoffDescription: 'QA Engineer agent',
  },
  [AgentName.SECURITY_ENGINEER]: {
    name: 'Security Engineer',
    instructions: 'Reviews project security.',
    handoffDescription: 'Security Engineer agent',
  },
  [AgentName.DOCUMENTATION_WRITER]: {
    name: 'Documentation Writer',
    instructions: 'Creates project documentation.',
    handoffDescription: 'Documentation Writer agent',
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Agent is generic with any by SDK design
const agentInstanceMap: Record<string, Agent<any, any>> = {
  [AgentName.CEO]: ceo,
  [AgentName.PRODUCT_MANAGER]: productManager,
  [AgentName.BUSINESS_ANALYST]: businessAnalyst,
  [AgentName.ARCHITECT]: architect,
  [AgentName.FRONTEND_DEVELOPER]: frontendDeveloper,
  [AgentName.BACKEND_DEVELOPER]: backendDeveloper,
  [AgentName.DATABASE_DEVELOPER]: databaseDeveloper,
  [AgentName.QA_ENGINEER]: qaEngineer,
  [AgentName.SECURITY_ENGINEER]: securityEngineer,
  [AgentName.DOCUMENTATION_WRITER]: documentationWriter,
};

export async function runAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const config = agentDefinitions[options.agentName];
  if (!config) {
    throw new Error(`Unknown agent: ${options.agentName}`);
  }

  const agent = agentInstanceMap[options.agentName];
  if (!agent) {
    throw new Error(`Agent instance not found: ${options.agentName}`);
  }

  const runner = new Runner({
    modelProvider: getModelProvider(),
    model: getDefaultModel(),
  });

  const result = await runner.run(agent, options.input);
  const output = typeof result.finalOutput === 'string' ? result.finalOutput : '';

  return {
    output,
    agentName: options.agentName,
  };
}

export function getAvailableAgents(): AgentConfig[] {
  return Object.values(agentDefinitions);
}

export function getAgentConfig(name: string): AgentConfig | undefined {
  return agentDefinitions[name];
}
