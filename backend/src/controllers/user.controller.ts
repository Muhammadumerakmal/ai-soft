import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.user!.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
