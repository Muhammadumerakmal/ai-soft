import type { Request, Response, NextFunction } from 'express';

import { OrchestratorService } from '../orchestrator';

const orchestratorService = new OrchestratorService();

export class WorkflowController {
  async getWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orchestratorService.getWorkflowByProject(req.user!.id, req.params.id!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orchestratorService.approve(req.user!.id, req.params.id!, req.body.comment);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orchestratorService.reject(req.user!.id, req.params.id!, req.body.comment);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
