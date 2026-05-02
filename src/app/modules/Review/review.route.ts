
import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '@prisma/client';
import {
  createReviewSchema,
  updateReviewSchema,
  getTrainerReviewsSchema,
  getReviewByIdSchema,
  deleteReviewSchema,
  getMemberReviewsSchema,
  verifyReviewSchema,
  getAllReviewsQuerySchema,
  getTrainerRatingSummarySchema,
} from './review.validation';

const router = Router();

/**
 * @route   POST /api/v1/reviews
 * @desc    Create trainer review
 * @access  Member
 */
router.post(
  '/',
  authenticate,
  authorize([Role.MEMBER]),
  validateRequest(createReviewSchema),
  ReviewController.createReview
);

/**
 * @route   GET /api/v1/reviews
 * @desc    Get all reviews (Admin only)
 * @access  Admin, Super Admin
 */
router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getAllReviewsQuerySchema),
  ReviewController.getAllReviews
);

/**
 * @route   GET /api/v1/reviews/trainer/:trainerId
 * @desc    Get trainer reviews
 * @access  Public (or Authenticated)
 */
router.get(
  '/trainer/:trainerId',
  validateRequest(getTrainerReviewsSchema),
  ReviewController.getTrainerReviews
);

/**
 * @route   GET /api/v1/reviews/trainer/:trainerId/summary
 * @desc    Get trainer rating summary
 * @access  Public
 */
router.get(
  '/trainer/:trainerId/summary',
  validateRequest(getTrainerRatingSummarySchema),
  ReviewController.getTrainerRatingSummary
);

/**
 * @route   GET /api/v1/reviews/member/:memberId
 * @desc    Get member's reviews
 * @access  Owner, Admin, Super Admin
 */
router.get(
  '/member/:memberId',
  authenticate,
  validateRequest(getMemberReviewsSchema),
  ReviewController.getMemberReviews
);

/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 * @access  Authenticated
 */
router.get(
  '/:id',
  authenticate,
  validateRequest(getReviewByIdSchema),
  ReviewController.getReviewById
);

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update review
 * @access  Owner, Admin, Super Admin
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(updateReviewSchema),
  ReviewController.updateReview
);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Owner, Admin, Super Admin
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest(deleteReviewSchema),
  ReviewController.deleteReview
);

/**
 * @route   PATCH /api/v1/reviews/:id/verify
 * @desc    Verify/Unverify review
 * @access  Admin, Super Admin
 */
router.patch(
  '/:id/verify',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(verifyReviewSchema),
  ReviewController.verifyReview
);

export const ReviewRoutes = router;