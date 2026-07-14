import OpenAI from 'openai';
import { env } from './index';

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: env.OPENAI_BASE_URL,
  defaultHeaders: env.OPENAI_BASE_URL?.includes('openrouter.ai')
    ? { 'HTTP-Referer': 'https://aisoftco.local', 'X-Title': 'AI Software Company' }
    : undefined,
});
