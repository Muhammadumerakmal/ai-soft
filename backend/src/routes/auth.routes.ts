import { Router } from 'express';
import { registerSchema, loginSchema, refreshTokenSchema } from '@aisoftco/shared';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rate-limit';

const router = Router();
const authController = new AuthController();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', validate(refreshTokenSchema), authController.logout);

export default router;
