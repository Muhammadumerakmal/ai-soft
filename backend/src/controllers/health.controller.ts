import type { Request, Response, NextFunction } from 'express';

import { HealthService } from '../services/health.service';

const healthService = new HealthService();

export class HealthController {
  async liveness(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthService.checkLiveness();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async readiness(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthService.checkReadiness();
      const statusCode = result.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async detailed(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthService.checkDetailed();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
