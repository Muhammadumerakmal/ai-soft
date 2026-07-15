import {
  createTeamSchema,
  updateTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  uuidSchema,
} from '@aisoftco/shared';
import { Router } from 'express';
import { z } from 'zod';

import { TeamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const idParamsSchema = z.object({ id: uuidSchema });
const memberParamsSchema = z.object({ id: uuidSchema, memberId: uuidSchema });

const router = Router();
const teamController = new TeamController();

router.use(authenticate);

router.post('/', validate(createTeamSchema), teamController.create);
router.get('/', teamController.list);
router.get('/:id', validate(idParamsSchema, 'params'), teamController.getById);
router.patch('/:id', validate(idParamsSchema, 'params'), validate(updateTeamSchema), teamController.update);

router.post(
  '/:id/members',
  validate(idParamsSchema, 'params'),
  validate(inviteMemberSchema),
  teamController.inviteMember
);
router.patch(
  '/:id/members/:memberId',
  validate(memberParamsSchema, 'params'),
  validate(updateMemberRoleSchema),
  teamController.updateMemberRole
);
router.delete('/:id/members/:memberId', validate(memberParamsSchema, 'params'), teamController.removeMember);

export default router;
