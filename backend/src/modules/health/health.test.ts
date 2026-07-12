import { describe, it, expect } from 'vitest';
import { buildApp } from '../../app.js';

describe('GET /health', () => {
  it('returns status ok', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body) as Record<string, unknown>;
    expect(body).toHaveProperty('status', 'ok');
  });
});
