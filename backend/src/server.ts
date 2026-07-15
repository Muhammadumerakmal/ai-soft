import http from 'http';

import app from './app';
import { env } from './config';
import { startMcpServer } from './mcp/server';
import { startWorker } from './orchestrator/pipeline';
import { logger } from './utils/logger';
import { createSocketServer } from './ws/socket-server';

const httpServer = http.createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'Server started');
  startWorker();

  // The MCP server is a fully independent Express app on its own port — it
  // fails closed (503 on every request) if MCP_API_KEY isn't set, so it's
  // always safe to start alongside the main API.
  startMcpServer();
});
