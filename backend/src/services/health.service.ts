import { sql } from 'drizzle-orm';
import { db } from '../config/database';
import { redis } from '../config/redis';
import { env } from '../config';
import { logger } from '../utils/logger';

const CHECK_NAMES = ['database', 'openai', 'redis'] as const;

export class HealthService {
  async checkLiveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async checkReadiness() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkOpenAI(),
      this.checkRedis(),
    ]);

    const details: Record<string, { status: string; latency?: number; error?: string }> = {};
    let allHealthy = true;

    checks.forEach((result, index) => {
      const name = CHECK_NAMES[index] ?? 'unknown';
      if (result.status === 'fulfilled') {
        details[name] = result.value;
        if (result.value.status !== 'healthy' && result.value.status !== 'skipped') {
          allHealthy = false;
        }
      } else {
        details[name] = { status: 'unhealthy', error: result.reason.message };
        allHealthy = false;
      }
    });

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      details,
    };
  }

  async checkDetailed() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkOpenAI(),
      this.checkRedis(),
    ]);

    const details: Record<string, { status: string; latency?: number; error?: string }> = {};

    checks.forEach((result, index) => {
      const name = CHECK_NAMES[index] ?? 'unknown';
      if (result.status === 'fulfilled') {
        details[name] = result.value;
      } else {
        details[name] = { status: 'unhealthy', error: result.reason.message };
      }
    });

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      details,
    };
  }

  private async checkDatabase() {
    const start = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      logger.error({ error }, 'Database health check failed');
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }

  private async checkOpenAI() {
    const start = Date.now();
    try {
      if (!env.OPENAI_API_KEY) {
        return { status: 'unhealthy', error: 'OPENAI_API_KEY not configured' };
      }
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      logger.error({ error }, 'OpenAI health check failed');
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }

  private async checkRedis() {
    const start = Date.now();
    if (!redis) {
      return { status: 'skipped', error: 'REDIS_URL not configured' };
    }
    try {
      await redis.ping();
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      logger.error({ error }, 'Redis health check failed');
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }
}
