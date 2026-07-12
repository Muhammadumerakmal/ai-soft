import { type FastifyInstance } from 'fastify';

export function createLoggerConfig(env: string) {
  const isDev = env === 'development';
  return {
    level: isDev ? 'debug' : 'info',
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss.l' },
        }
      : undefined,
  };
}

export function logRouteInfo(app: FastifyInstance) {
  app.log.info(`Registered routes:`);
  for (const route of app.printRoutes().split('\n')) {
    if (route.trim()) app.log.info(route.trim());
  }
}
