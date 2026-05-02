
import { Router } from 'express';
import { ProgressController } from './progress.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createBodyMetricSchema,
  updateBodyMetricSchema,
  getMemberMetricsQuerySchema,
  uploadProgressPhotoSchema,
  getMemberPhotosQuerySchema,
  photoIdParamSchema,
  metricIdParamSchema,
  memberIdParamSchema,
  compareMetricsSchema,
  calculateBMISchema,
} from './progress.validation';
import { Role } from '@prisma/client';

const router = Router();

// ============================================
// BODY METRICS ROUTES
// ============================================

// Create body metric (Member, Trainer, Admin)
router.post(
  '/metrics',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(createBodyMetricSchema),
  ProgressController.createBodyMetric
);

// Get member metrics
router.get(
  '/metrics/member/:memberId',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getMemberMetricsQuerySchema),
  ProgressController.getMemberMetrics
);

// Get latest metric for a member
router.get(
  '/metrics/member/:memberId/latest',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(memberIdParamSchema),
  ProgressController.getLatestMetric
);

// Get metric by ID
router.get(
  '/metrics/:id',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(metricIdParamSchema),
  ProgressController.getMetricById
);

// Update body metric
router.put(
  '/metrics/:id',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(updateBodyMetricSchema),
  ProgressController.updateBodyMetric
);

// Delete body metric
router.delete(
  '/metrics/:id',
  authenticate,
  authorize([Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(metricIdParamSchema),
  ProgressController.deleteBodyMetric
);

// ============================================
// PROGRESS PHOTOS ROUTES
// ============================================

// Upload progress photo (Member, Trainer, Admin)
router.post(
  '/photos',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(uploadProgressPhotoSchema),
  ProgressController.uploadProgressPhoto
);

// Get member photos
router.get(
  '/photos/member/:memberId',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getMemberPhotosQuerySchema),
  ProgressController.getMemberPhotos
);

// Get photo by ID
router.get(
  '/photos/:id',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(photoIdParamSchema),
  ProgressController.getPhotoById
);

// Delete progress photo
router.delete(
  '/photos/:id',
  authenticate,
  authorize([Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(photoIdParamSchema),
  ProgressController.deleteProgressPhoto
);

// ============================================
// ANALYTICS & COMPARISON ROUTES
// ============================================

// Compare metrics over a period
router.get(
  '/analytics/compare/:memberId',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(compareMetricsSchema),
  ProgressController.compareMetrics
);

// Get progress summary
router.get(
  '/analytics/summary/:memberId',
  authenticate,
  authorize([Role.MEMBER, Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(memberIdParamSchema),
  ProgressController.getProgressSummary
);

// Calculate BMI (Public utility)
router.post(
  '/tools/calculate-bmi',
  validateRequest(calculateBMISchema),
  ProgressController.calculateBMI
);

export const ProgressRoutes = router;

