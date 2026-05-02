"use strict";
// src/modules/review/review.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const review_service_1 = require("./review.service");
const sendResponse_1 = require("../../../utils/sendResponse");
class ReviewController {
}
exports.ReviewController = ReviewController;
_a = ReviewController;
/**
 * Create trainer review
 */
ReviewController.createReview = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user;
    const review = await review_service_1.ReviewService.createReview(req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Review created successfully',
        data: review,
    });
});
/**
 * Get trainer reviews
 */
ReviewController.getTrainerReviews = (0, catchAsync_1.default)(async (req, res, next) => {
    const { trainerId } = req.params;
    const result = await review_service_1.ReviewService.getTrainerReviews(trainerId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
    });
});
/**
 * Get review by ID
 */
ReviewController.getReviewById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const review = await review_service_1.ReviewService.getReviewById(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Review retrieved successfully',
        data: review,
    });
});
/**
 * Update review
 */
ReviewController.updateReview = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const review = await review_service_1.ReviewService.updateReview(id, req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Review updated successfully',
        data: review,
    });
});
/**
 * Delete review
 */
ReviewController.deleteReview = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const result = await review_service_1.ReviewService.deleteReview(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
/**
 * Get member's reviews
 */
ReviewController.getMemberReviews = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const user = req.user;
    const result = await review_service_1.ReviewService.getMemberReviews(memberId, req.query, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
    });
});
/**
 * Verify review (Admin only)
 */
ReviewController.verifyReview = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { isVerified } = req.body;
    const user = req.user;
    const review = await review_service_1.ReviewService.verifyReview(id, isVerified, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Review ${isVerified ? 'verified' : 'unverified'} successfully`,
        data: review,
    });
});
/**
 * Get all reviews (Admin only)
 */
ReviewController.getAllReviews = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await review_service_1.ReviewService.getAllReviews(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
    });
});
/**
 * Get trainer rating summary
 */
ReviewController.getTrainerRatingSummary = (0, catchAsync_1.default)(async (req, res, next) => {
    const { trainerId } = req.params;
    const summary = await review_service_1.ReviewService.getTrainerRatingSummary(trainerId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer rating summary retrieved successfully',
        data: summary,
    });
});
