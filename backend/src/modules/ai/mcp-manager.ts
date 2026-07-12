import { MCPServerStdio, type MCPServer, connectMcpServers } from '@openai/agents';
import type { Agent } from '@openai/agents';
import { getEnv } from '../../config/env.js';

export interface McpServerDef {
  id: string;
  label: string;
  create: () => MCPServer | null;
}

function githubServer(): MCPServer | null {
  const token = getEnv().GITHUB_TOKEN;
  if (!token) return null;

  return new MCPServerStdio({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_TOKEN: token },
    name: 'github',
  });
}

function filesystemServer(): MCPServer | null {
  const dirsRaw = getEnv().MCP_ALLOWED_DIRS;
  if (!dirsRaw) return null;

  const allowedDirs = dirsRaw
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
  if (allowedDirs.length === 0) return null;

  return new MCPServerStdio({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedDirs],
    name: 'filesystem',
  });
}

function postgresServer(): MCPServer | null {
  const dbUrl = getEnv().DATABASE_URL;
  if (!dbUrl) return null;

  return new MCPServerStdio({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', dbUrl],
    name: 'postgres',
  });
}

function playwrightServer(): MCPServer | null {
  return new MCPServerStdio({
    command: 'npx',
    args: ['-y', '@anthropic/mcp-playwright'],
    name: 'playwright',
  });
}

const serverFactories: Record<string, McpServerDef> = {
  github: { id: 'github', label: 'GitHub (repo management, PRs, issues)', create: githubServer },
  filesystem: {
    id: 'filesystem',
    label: 'Filesystem (read/write project files)',
    create: filesystemServer,
  },
  postgres: {
    id: 'postgres',
    label: 'PostgreSQL (database inspection, queries)',
    create: postgresServer,
  },
  playwright: {
    id: 'playwright',
    label: 'Playwright (browser automation, web testing)',
    create: playwrightServer,
  },
};

export async function buildMcpEnvironment(): Promise<{
  servers: MCPServer[];
  close: () => Promise<void>;
  summaries: string;
}> {
  const emptyClose = () => Promise.resolve();
  const enabled = getEnv().MCP_ENABLED;
  if (!enabled) {
    return { servers: [], close: emptyClose, summaries: '' };
  }

  const instances: MCPServer[] = [];
  const summaries: string[] = [];

  for (const def of Object.values(serverFactories)) {
    const server = def.create();
    if (server) {
      instances.push(server);
      summaries.push(`  - ${def.label} (id: ${def.id})`);
    }
  }

  if (instances.length === 0) {
    return { servers: [], close: emptyClose, summaries: '' };
  }

  const manager = await connectMcpServers(instances, { dropFailed: true });

  return {
    servers: manager.active,
    close: () => manager.close(),
    summaries: summaries.join('\n'),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Agent is generic by SDK design
type AnyAgent = Agent<any, any>;

export function createMcpAwareAgent(base: AnyAgent, mcpServers: MCPServer[]): AnyAgent {
  if (mcpServers.length === 0) return base;
  return base.clone({ mcpServers });
}

export function getServerDefinitions(): McpServerDef[] {
  return Object.values(serverFactories);
}
