import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./src/db/schema/*', './src/db/enums.ts'],
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
