import type { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { registerUser, loginUser, generateTokenPayload } from './auth.service.js';

export function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await registerUser(body);

    const token = app.jwt.sign(generateTokenPayload(result.user));

    reply
      .setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })
      .status(201)
      .send({
        data: { user: result.user, organization: result.organization },
      });
  });

  app.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await loginUser(body);

    const token = app.jwt.sign(generateTokenPayload(user));

    reply
      .setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })
      .send({
        data: { user },
      });
  });

  app.post('/auth/logout', async (_request, reply) => {
    reply
      .clearCookie('token', { path: '/' })
      .send({ data: { message: 'Logged out successfully' } });
  });

  app.get('/auth/me', { preHandler: [app.authenticate] }, (request) => {
    return {
      data: { id: request.userId, email: request.userEmail },
    };
  });
}
