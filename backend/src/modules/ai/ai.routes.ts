import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { runAgent, getAvailableAgents, getAgentConfig } from './ai.service.js';
import { AgentName } from './ai.types.js';
import { runPipeline } from './pipeline.js';
import { getModelProvider } from './openrouter.js';

const agentNameValues = Object.values(AgentName) as [string, ...string[]];

const runBodySchema = z.object({
  agentName: z.enum(agentNameValues),
  input: z.string().min(1).max(32000),
});

const pipelineBodySchema = z.object({
  idea: z.string().min(10).max(50000),
});

export function aiRoutes(app: FastifyInstance) {
  app.get('/agents', () => {
    const agents = getAvailableAgents();
    return {
      data: agents.map((a) => ({
        name: a.name,
        handoffDescription: a.handoffDescription,
      })),
    };
  });

  app.get('/agents/:name', async (request, reply) => {
    const { name } = z.object({ name: z.enum(agentNameValues) }).parse(request.params);

    const config = getAgentConfig(name);
    if (!config) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: `Agent '${name}' not found` },
      });
    }

    return {
      data: {
        name: config.name,
        instructions: config.instructions,
        handoffDescription: config.handoffDescription,
      },
    };
  });

  app.post('/agents/run', async (request, _reply) => {
    const body = runBodySchema.parse(request.body);

    const result = await runAgent(body);

    return {
      data: {
        output: result.output,
        agentName: result.agentName,
      },
    };
  });

  app.post('/pipeline/run', async (request, reply) => {
    const body = pipelineBodySchema.parse(request.body);

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    reply.hijack();

    const modelProvider = getModelProvider();

    try {
      for await (const event of runPipeline(modelProvider, body.idea)) {
        const data = JSON.stringify(event);
        reply.raw.write(`data: ${data}\n\n`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      reply.raw.write(
        `data: ${JSON.stringify({ type: 'pipeline_error', phase: 'unknown', error: message })}\n\n`,
      );
    } finally {
      reply.raw.end();
    }
  });
}
