import type { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service';

const teamService = new TeamService();

export class TeamController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await teamService.list(req.user!.id);
      res.json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.getById(req.user!.id, req.params.id!);
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.update(req.user!.id, req.params.id!, req.body);
      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await teamService.inviteMember(req.user!.id, req.params.id!, req.body);
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      await teamService.updateMemberRole(req.user!.id, req.params.id!, req.params.memberId!, req.body.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await teamService.removeMember(req.user!.id, req.params.id!, req.params.memberId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
