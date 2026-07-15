import { registerSchema, loginSchema, refreshTokenSchema } from '@aisoftco/shared';
import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validate';

const router = Router();
const authController = new AuthController();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', validate(refreshTokenSchema), authController.logout);

export default router;
