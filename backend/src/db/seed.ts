import { eq } from 'drizzle-orm';

import { db } from '../config/database';
import { logger } from '../utils/logger';

import { aiAgents } from './schema';

const AGENT_DEFAULTS = [
  {
    name: 'CEO Agent',
    agentType: 'ceo' as const,
    model: 'openrouter/free',
    temperature: 0.4,
    maxTokens: 2048,
  },
  {
    name: 'PM Agent',
    agentType: 'pm' as const,
    model: 'openrouter/free',
    temperature: 0.3,
    maxTokens: 4096,
  },
  {
    name: 'Architect Agent',
    agentType: 'architect' as const,
    model: 'openrouter/free',
    temperature: 0.2,
    maxTokens: 4096,
  },
  {
    name: 'UI Designer Agent',
    agentType: 'ui_designer' as const,
    model: 'openrouter/free',
    temperature: 0.4,
    maxTokens: 6000,
  },
  {
    name: 'DB Engineer Agent',
    agentType: 'db_engineer' as const,
    model: 'openrouter/free',
    temperature: 0.2,
    maxTokens: 8000,
  },
  {
    name: 'Backend Engineer Agent',
    agentType: 'backend_engineer' as const,
    model: 'openrouter/free',
    temperature: 0.2,
    maxTokens: 8000,
  },
  {
    name: 'Frontend Engineer Agent',
    agentType: 'frontend_engineer' as const,
    model: 'openrouter/free',
    temperature: 0.2,
    maxTokens: 8000,
  },
  {
    name: 'QA Agent',
    agentType: 'qa' as const,
    model: 'openrouter/free',
    temperature: 0.3,
    maxTokens: 8000,
  },
  {
    name: 'DevOps Agent',
    agentType: 'devops' as const,
    model: 'openrouter/free',
    temperature: 0.2,
    maxTokens: 6000,
  },
  {
    name: 'Documentation Agent',
    agentType: 'documentation' as const,
    model: 'openrouter/free',
    temperature: 0.3,
    maxTokens: 8000,
  },
];

async function seed() {
  for (const agent of AGENT_DEFAULTS) {
    const [existing] = await db.select().from(aiAgents).where(eq(aiAgents.agentType, agent.agentType));
    if (existing) {
      await db
        .update(aiAgents)
        .set({ model: agent.model, temperature: agent.temperature, maxTokens: agent.maxTokens, updatedAt: new Date() })
        .where(eq(aiAgents.id, existing.id));
      logger.info({ agentType: agent.agentType, model: agent.model }, 'Updated agent config');
      continue;
    }
    await db.insert(aiAgents).values(agent);
    logger.info({ agentType: agent.agentType }, 'Seeded agent config');
  }
}

seed()
  .then(() => {
    logger.info('Seed complete');
    process.exit(0);
  })
  .catch((error) => {
    logger.error({ error }, 'Seed failed');
    process.exit(1);
  });
