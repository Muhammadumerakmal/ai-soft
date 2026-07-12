import { tool } from '@openai/agents';
import { z } from 'zod';

const CONTEXT7_API = 'https://api.context7.workers.dev';

async function context7Fetch(path: string, body: unknown): Promise<unknown> {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    throw new Error('CONTEXT7_API_KEY not set');
  }

  const response = await fetch(`${CONTEXT7_API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Context7 API error: ${String(response.status)} ${await response.text()}`);
  }

  return response.json();
}

export const resolveLibraryIdTool = tool({
  name: 'context7_resolve_library',
  description:
    'Resolve a library/package name to a Context7 library ID for documentation lookup. Call this first before querying docs.',
  parameters: z.object({
    libraryName: z
      .string()
      .describe('The official library or package name (e.g. "Next.js", "Prisma", "Express")'),
    query: z.string().describe('What you want to know about this library'),
  }),
  execute: async ({ libraryName, query }) => {
    const result = await context7Fetch('/resolve-library-id', {
      libraryName,
      query,
    });

    return JSON.stringify(result, null, 2);
  },
});

export const queryDocsTool = tool({
  name: 'context7_query_docs',
  description:
    'Query documentation for a library using its Context7 library ID (e.g. "/vercel/next.js"). Get the ID first via context7_resolve_library.',
  parameters: z.object({
    libraryId: z
      .string()
      .describe('The Context7 library ID in format "/org/project" (e.g. "/vercel/next.js")'),
    query: z.string().describe('The specific question or topic to look up'),
  }),
  execute: async ({ libraryId, query }) => {
    const result = await context7Fetch('/query-docs', {
      libraryId,
      query,
    });

    return JSON.stringify(result, null, 2);
  },
});

export const context7Tools = [resolveLibraryIdTool, queryDocsTool];
