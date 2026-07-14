import { Router } from 'express';
import { z } from 'zod';
import {
  createProjectSchema,
  updateProjectSchema,
  paginationSchema,
  uuidSchema,
  approveStepSchema,
  rejectStepSchema,
} from '@aisoftco/shared';
import { ProjectController } from '../controllers/project.controller';
import { WorkflowController } from '../controllers/workflow.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const idParamsSchema = z.object({ id: uuidSchema });

const router = Router();
const projectController = new ProjectController();
const workflowController = new WorkflowController();

router.use(authenticate);

router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', validate(paginationSchema, 'query'), projectController.list);
router.get('/:id', validate(idParamsSchema, 'params'), projectController.getById);
router.patch('/:id', validate(idParamsSchema, 'params'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', validate(idParamsSchema, 'params'), projectController.remove);

router.get('/:id/workflow', validate(idParamsSchema, 'params'), workflowController.getWorkflow);
router.post(
  '/:id/approve',
  validate(idParamsSchema, 'params'),
  validate(approveStepSchema),
  workflowController.approve
);
router.post(
  '/:id/reject',
  validate(idParamsSchema, 'params'),
  validate(rejectStepSchema),
  workflowController.reject
);

export default router;
