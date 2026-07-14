import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

router.get('/', healthController.liveness);
router.get('/ready', healthController.readiness);
router.get('/detailed', healthController.detailed);

export default router;
