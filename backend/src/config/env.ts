import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z.url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4o'),
  GITHUB_TOKEN: z.string().optional(),
  MCP_ALLOWED_DIRS: z.string().optional(),
  CONTEXT7_API_KEY: z.string().optional(),
  MCP_ENABLED: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const tree = z.treeifyError(result.error);
    console.error('Invalid environment variables:', tree);
    process.exit(1);
  }
  _env = result.data;
  return _env;
}
