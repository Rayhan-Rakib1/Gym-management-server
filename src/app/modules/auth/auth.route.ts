import { Router } from 'express';
import { AuthController } from './auth.controller';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from './auth.validation';
import { rateLimiter } from '../../middlewares/rateLimiter';
import { validateRequest } from '../../middlewares/validateRequest';
import { authenticate } from '../../middlewares/auth';

const router = Router();


router.post(
  '/register',
  rateLimiter(5, 15), // 5 requests per 15 minutes
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  rateLimiter(10, 15), // 10 requests per 15 minutes
  validateRequest(loginSchema),
  AuthController.login
);

router.post('/logout', AuthController.logout);

router.post('/refresh-token', AuthController.refreshToken);

router.post(
  '/forgot-password',
  rateLimiter(3, 60), // 3 requests per hour
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password/:token',
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword
);

router.post(
  '/verify-email/:token',
  validateRequest(verifyEmailSchema),
  AuthController.verifyEmail
);

router.post(
  '/resend-verification',
  authenticate,
  rateLimiter(3, 60), // 3 requests per hour
  AuthController.resendVerification
);

router.get('/me', authenticate, AuthController.getMe);

router.put(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  AuthController.changePassword
);

export const authRoutes = router;