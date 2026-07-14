import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  next();
}
