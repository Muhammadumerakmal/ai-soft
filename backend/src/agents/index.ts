import type { AgentType } from '@aisoftco/shared';

import { architectAgent } from './architect.agent';
import { backendEngineerAgent } from './backend-engineer.agent';
import { ceoAgent } from './ceo.agent';
import { dbEngineerAgent } from './db-engineer.agent';
import { devopsAgent } from './devops.agent';
import { documentationAgent } from './documentation.agent';
import { frontendEngineerAgent } from './frontend-engineer.agent';
import { pmAgent } from './pm.agent';
import { qaAgent } from './qa.agent';
import type { AgentDefinition } from './types';
import { uiDesignerAgent } from './ui-designer.agent';

export const PIPELINE_STAGES: AgentType[][] = [
  ['ceo'],
  ['pm'],
  ['architect'],
  ['ui_designer', 'db_engineer', 'backend_engineer', 'frontend_engineer'],
  ['qa'],
  ['devops'],
  ['documentation'],
];

export const AGENT_REGISTRY: Partial<Record<AgentType, AgentDefinition>> = {
  ceo: ceoAgent,
  pm: pmAgent,
  architect: architectAgent,
  ui_designer: uiDesignerAgent,
  db_engineer: dbEngineerAgent,
  backend_engineer: backendEngineerAgent,
  frontend_engineer: frontendEngineerAgent,
  qa: qaAgent,
  devops: devopsAgent,
  documentation: documentationAgent,
};

export function getAgentDefinition(type: AgentType): AgentDefinition {
  const agent = AGENT_REGISTRY[type];
  if (!agent) {
    throw new Error(`No agent definition registered for type: ${type}`);
  }
  return agent;
}

export * from './types';
