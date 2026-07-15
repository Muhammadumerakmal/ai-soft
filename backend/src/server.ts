import http from 'http';

import app from './app';
import { env } from './config';
import { startWorker } from './orchestrator/pipeline';
import { logger } from './utils/logger';
import { createSocketServer } from './ws/socket-server';

const httpServer = http.createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'Server started');
  startWorker();
});
