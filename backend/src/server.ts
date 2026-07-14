import http from 'http';
import app from './app';
import { env } from './config';
import { logger } from './utils/logger';
import { startWorker } from './orchestrator/pipeline';
import { createSocketServer } from './ws/socket-server';

const httpServer = http.createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'Server started');
  startWorker();
});
