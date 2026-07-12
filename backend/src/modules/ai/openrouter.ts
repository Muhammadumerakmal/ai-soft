import { OpenAIProvider } from '@openai/agents';
import { getEnv } from '../../config/env.js';

let provider: OpenAIProvider | null = null;

export function getModelProvider(): OpenAIProvider {
  if (provider) return provider;

  const env = getEnv();

  provider = new OpenAIProvider({
    baseURL: env.OPENROUTER_BASE_URL,
    apiKey: env.OPENROUTER_API_KEY,
    useResponses: false,
  });

  return provider;
}

export function getDefaultModel(): string {
  return getEnv().OPENROUTER_MODEL;
}
