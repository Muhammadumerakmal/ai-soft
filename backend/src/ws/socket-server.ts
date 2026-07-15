import type { Server as HttpServer } from 'http';

import { Server } from 'socket.io';

import { env } from '../config';
import { verifyAccessToken } from '../config/jwt';
import { logger } from '../utils/logger';

let io: Server | null = null;

export function createSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });
  });

  logger.info('Socket.IO server started');
  return io;
}

export function emitToProject(projectId: string, event: string, payload: unknown) {
  io?.to(`project:${projectId}`).emit(event, payload);
}
