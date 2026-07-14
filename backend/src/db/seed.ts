import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { aiAgents } from './schema';
import { logger } from '../utils/logger';

const AGENT_DEFAULTS = [
  {
    name: 'CEO Agent',
    agentType: 'ceo' as const,
    model: 'poolside/laguna-m.1:free',
    temperature: 0.4,
    maxTokens: 2048,
  },
  {
    name: 'PM Agent',
    agentType: 'pm' as const,
    model: 'poolside/laguna-m.1:free',
    temperature: 0.3,
    maxTokens: 4096,
  },
  {
    name: 'Architect Agent',
    agentType: 'architect' as const,
    model: 'poolside/laguna-m.1:free',
    temperature: 0.2,
    maxTokens: 4096,
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
