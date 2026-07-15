import Redis from 'ioredis';

import { logger } from '../utils/logger';

import { env } from './index';

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  : null;

if (redis) {
  redis.on('error', (error) => logger.error({ error }, 'Redis connection error'));
} else {
  logger.warn('REDIS_URL not configured — queue-backed features are disabled');
}
