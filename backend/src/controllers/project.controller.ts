import type { Request, Response, NextFunction } from 'express';

import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.list(req.user!.id, req.query as never);
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getById(req.user!.id, req.params.id!);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.update(req.user!.id, req.params.id!, req.body);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.remove(req.user!.id, req.params.id!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
