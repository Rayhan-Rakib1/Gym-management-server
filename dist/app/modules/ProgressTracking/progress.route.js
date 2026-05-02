"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressRoutes = void 0;
const express_1 = require("express");
const progress_controller_1 = require("./progress.controller");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const progress_validation_1 = require("./progress.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ============================================
// BODY METRICS ROUTES
// ============================================
// Create body metric (Member, Trainer, Admin)
router.post('/metrics', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.createBodyMetricSchema), progress_controller_1.ProgressController.createBodyMetric);
// Get member metrics
router.get('/metrics/member/:memberId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.getMemberMetricsQuerySchema), progress_controller_1.ProgressController.getMemberMetrics);
// Get latest metric for a member
router.get('/metrics/member/:memberId/latest', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.memberIdParamSchema), progress_controller_1.ProgressController.getLatestMetric);
// Get metric by ID
router.get('/metrics/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.metricIdParamSchema), progress_controller_1.ProgressController.getMetricById);
// Update body metric
router.put('/metrics/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.updateBodyMetricSchema), progress_controller_1.ProgressController.updateBodyMetric);
// Delete body metric
router.delete('/metrics/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.metricIdParamSchema), progress_controller_1.ProgressController.deleteBodyMetric);
// ============================================
// PROGRESS PHOTOS ROUTES
// ============================================
// Upload progress photo (Member, Trainer, Admin)
router.post('/photos', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.uploadProgressPhotoSchema), progress_controller_1.ProgressController.uploadProgressPhoto);
// Get member photos
router.get('/photos/member/:memberId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.getMemberPhotosQuerySchema), progress_controller_1.ProgressController.getMemberPhotos);
// Get photo by ID
router.get('/photos/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.photoIdParamSchema), progress_controller_1.ProgressController.getPhotoById);
// Delete progress photo
router.delete('/photos/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.photoIdParamSchema), progress_controller_1.ProgressController.deleteProgressPhoto);
// ============================================
// ANALYTICS & COMPARISON ROUTES
// ============================================
// Compare metrics over a period
router.get('/analytics/compare/:memberId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.compareMetricsSchema), progress_controller_1.ProgressController.compareMetrics);
// Get progress summary
router.get('/analytics/summary/:memberId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(progress_validation_1.memberIdParamSchema), progress_controller_1.ProgressController.getProgressSummary);
// Calculate BMI (Public utility)
router.post('/tools/calculate-bmi', (0, validateRequest_1.validateRequest)(progress_validation_1.calculateBMISchema), progress_controller_1.ProgressController.calculateBMI);
exports.ProgressRoutes = router;
