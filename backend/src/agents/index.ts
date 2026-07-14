import type { AgentType } from '@aisoftco/shared';
import type { AgentDefinition } from './types';
import { ceoAgent } from './ceo.agent';
import { pmAgent } from './pm.agent';
import { architectAgent } from './architect.agent';

export const PIPELINE_ORDER: AgentType[] = ['ceo', 'pm', 'architect'];

export const AGENT_REGISTRY: Partial<Record<AgentType, AgentDefinition>> = {
  ceo: ceoAgent,
  pm: pmAgent,
  architect: architectAgent,
};

export function getAgentDefinition(type: AgentType): AgentDefinition {
  const agent = AGENT_REGISTRY[type];
  if (!agent) {
    throw new Error(`No agent definition registered for type: ${type}`);
  }
  return agent;
}

export * from './types';
