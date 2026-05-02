"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/register', (0, rateLimiter_1.rateLimiter)(5, 15), // 5 requests per 15 minutes
(0, validateRequest_1.validateRequest)(auth_validation_1.registerSchema), auth_controller_1.AuthController.register);
router.post('/login', (0, rateLimiter_1.rateLimiter)(10, 15), // 10 requests per 15 minutes
(0, validateRequest_1.validateRequest)(auth_validation_1.loginSchema), auth_controller_1.AuthController.login);
router.post('/logout', auth_controller_1.AuthController.logout);
router.post('/refresh-token', auth_controller_1.AuthController.refreshToken);
router.post('/forgot-password', (0, rateLimiter_1.rateLimiter)(3, 60), // 3 requests per hour
(0, validateRequest_1.validateRequest)(auth_validation_1.forgotPasswordSchema), auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password/:token', (0, validateRequest_1.validateRequest)(auth_validation_1.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
router.post('/verify-email/:token', (0, validateRequest_1.validateRequest)(auth_validation_1.verifyEmailSchema), auth_controller_1.AuthController.verifyEmail);
router.post('/resend-verification', auth_1.authenticate, (0, rateLimiter_1.rateLimiter)(3, 60), // 3 requests per hour
auth_controller_1.AuthController.resendVerification);
router.get('/me', auth_1.authenticate, auth_controller_1.AuthController.getMe);
router.put('/change-password', auth_1.authenticate, (0, validateRequest_1.validateRequest)(auth_validation_1.changePasswordSchema), auth_controller_1.AuthController.changePassword);
exports.authRoutes = router;
