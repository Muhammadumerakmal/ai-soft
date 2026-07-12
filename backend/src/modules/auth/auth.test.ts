import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../../app.js';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

describe('POST /auth/register', () => {
  it('rejects missing fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {},
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects short password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'Test', email: 'test@example.com', password: '123' },
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('rejects invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'nonexistent@example.com', password: 'password123' },
    });
    expect(response.statusCode).toBe(401);
  });
});
