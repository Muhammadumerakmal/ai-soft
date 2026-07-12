import type { Agent, ModelProvider } from '@openai/agents';
import { Runner } from '@openai/agents';
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
  applyMcpToAgent,
} from './agents.js';
import { buildMcpEnvironment } from './mcp-manager.js';
import { context7Tools } from './context7-tools.js';
import { getDefaultModel } from './openrouter.js';

export interface PipelinePhase {
  name: string;
  label: string;
}

export type PipelineEvent =
  | { type: 'phase_start'; phase: string; label: string }
  | { type: 'phase_delta'; phase: string; delta: string }
  | { type: 'phase_complete'; phase: string; output: string }
  | { type: 'pipeline_complete'; outputs: Record<string, string>; fullOutput: string }
  | { type: 'pipeline_error'; phase: string; error: string }
  | { type: 'mcp_status'; enabled: boolean; servers: string; tools: string[] };

interface PhaseConfig {
  agent: Agent;
  name: string;
  label: string;
}

const basePhases: PhaseConfig[] = [
  { agent: ceo, name: 'ceo', label: 'Project Analysis' },
  { agent: productManager, name: 'pm', label: 'Requirements Definition' },
  { agent: businessAnalyst, name: 'ba', label: 'Functional Specifications' },
  { agent: architect, name: 'architect', label: 'System Architecture' },
  { agent: frontendDeveloper, name: 'frontend', label: 'Frontend Plan' },
  { agent: backendDeveloper, name: 'backend', label: 'Backend Plan' },
  { agent: databaseDeveloper, name: 'database', label: 'Database Schema' },
  { agent: qaEngineer, name: 'qa', label: 'Test Plan' },
  { agent: securityEngineer, name: 'security', label: 'Security Review' },
  { agent: documentationWriter, name: 'docs', label: 'Documentation' },
];

export async function* runPipeline(
  modelProvider: ModelProvider,
  input: string,
): AsyncGenerator<PipelineEvent> {
  const model = getDefaultModel();

  const mcp = await buildMcpEnvironment();
  const allTools = [...context7Tools];

  yield {
    type: 'mcp_status',
    enabled: mcp.servers.length > 0,
    servers: mcp.summaries,
    tools: allTools.map((t) => t.name),
  };

  const phases: PhaseConfig[] = basePhases.map((p) => ({
    ...p,
    agent: applyMcpToAgent(p.agent, mcp.servers, allTools),
  }));

  const runner = new Runner({ modelProvider, model });

  let accumulatedContext = `## Project Idea\n${input}\n`;
  const outputs: Record<string, string> = {};

  try {
    for (const phase of phases) {
      yield { type: 'phase_start', phase: phase.name, label: phase.label };

      try {
        const result = await runner.run(phase.agent, accumulatedContext, { stream: true });

        const textStream = result.toTextStream();
        let output = '';

        for await (const chunk of textStream) {
          output += chunk;
          yield { type: 'phase_delta', phase: phase.name, delta: chunk };
        }

        outputs[phase.name] = output;
        accumulatedContext += `\n\n## ${phase.label}\n${output}\n`;

        yield { type: 'phase_complete', phase: phase.name, output };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        yield { type: 'pipeline_error', phase: phase.name, error: message };
        return;
      }
    }

    yield {
      type: 'pipeline_complete',
      outputs,
      fullOutput: accumulatedContext,
    };
  } finally {
    await mcp.close();
  }
}
