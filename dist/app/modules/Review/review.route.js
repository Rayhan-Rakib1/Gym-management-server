"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = require("express");
const review_controller_1 = require("./review.controller");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const client_1 = require("@prisma/client");
const review_validation_1 = require("./review.validation");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/reviews
 * @desc    Create trainer review
 * @access  Member
 */
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER]), (0, validateRequest_1.validateRequest)(review_validation_1.createReviewSchema), review_controller_1.ReviewController.createReview);
/**
 * @route   GET /api/v1/reviews
 * @desc    Get all reviews (Admin only)
 * @access  Admin, Super Admin
 */
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(review_validation_1.getAllReviewsQuerySchema), review_controller_1.ReviewController.getAllReviews);
/**
 * @route   GET /api/v1/reviews/trainer/:trainerId
 * @desc    Get trainer reviews
 * @access  Public (or Authenticated)
 */
router.get('/trainer/:trainerId', (0, validateRequest_1.validateRequest)(review_validation_1.getTrainerReviewsSchema), review_controller_1.ReviewController.getTrainerReviews);
/**
 * @route   GET /api/v1/reviews/trainer/:trainerId/summary
 * @desc    Get trainer rating summary
 * @access  Public
 */
router.get('/trainer/:trainerId/summary', (0, validateRequest_1.validateRequest)(review_validation_1.getTrainerRatingSummarySchema), review_controller_1.ReviewController.getTrainerRatingSummary);
/**
 * @route   GET /api/v1/reviews/member/:memberId
 * @desc    Get member's reviews
 * @access  Owner, Admin, Super Admin
 */
router.get('/member/:memberId', auth_1.authenticate, (0, validateRequest_1.validateRequest)(review_validation_1.getMemberReviewsSchema), review_controller_1.ReviewController.getMemberReviews);
/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 * @access  Authenticated
 */
router.get('/:id', auth_1.authenticate, (0, validateRequest_1.validateRequest)(review_validation_1.getReviewByIdSchema), review_controller_1.ReviewController.getReviewById);
/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update review
 * @access  Owner, Admin, Super Admin
 */
router.put('/:id', auth_1.authenticate, (0, validateRequest_1.validateRequest)(review_validation_1.updateReviewSchema), review_controller_1.ReviewController.updateReview);
/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Owner, Admin, Super Admin
 */
router.delete('/:id', auth_1.authenticate, (0, validateRequest_1.validateRequest)(review_validation_1.deleteReviewSchema), review_controller_1.ReviewController.deleteReview);
/**
 * @route   PATCH /api/v1/reviews/:id/verify
 * @desc    Verify/Unverify review
 * @access  Admin, Super Admin
 */
router.patch('/:id/verify', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(review_validation_1.verifyReviewSchema), review_controller_1.ReviewController.verifyReview);
exports.ReviewRoutes = router;
