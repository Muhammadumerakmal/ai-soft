import { Queue, Worker, type Job } from 'bullmq';

import { env } from '../config';
import { logger } from '../utils/logger';

import { executeStep } from './agent-executor';

export const QUEUE_NAME = 'agent-pipeline';

interface StepJobData {
  workflowStepId: string;
}

function getConnectionOptions() {
  if (!env.REDIS_URL) return null;
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
  };
}

const connection = getConnectionOptions();

export const pipelineQueue = connection ? new Queue(QUEUE_NAME, { connection }) : null;

let worker: Worker | null = null;

export function startWorker() {
  if (!connection || worker) return;

  worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const data = job.data as StepJobData;
      await executeStep(data.workflowStepId);
    },
    { connection }
  );

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, error }, 'Pipeline job failed');
  });

  logger.info('Agent pipeline worker started');
}

export async function enqueueStep(workflowStepId: string) {
  if (pipelineQueue) {
    await pipelineQueue.add('execute-step', { workflowStepId } satisfies StepJobData);
    return;
  }

  logger.warn({ workflowStepId }, 'REDIS_URL not configured — executing pipeline step inline');
  executeStep(workflowStepId).catch((error) => {
    logger.error({ error, workflowStepId }, 'Inline pipeline step execution failed');
  });
}
