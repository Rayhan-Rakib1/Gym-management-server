// src/modules/review/review.controller.ts

import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { ReviewService } from './review.service';
import { sendResponse } from '../../../utils/sendResponse';

export class ReviewController {
  /**
   * Create trainer review
   */
  static createReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user!;
      const review = await ReviewService.createReview(req.body, user);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    }
  );

  /**
   * Get trainer reviews
   */
  static getTrainerReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { trainerId } = req.params;

      const result = await ReviewService.getTrainerReviews(trainerId, req.query);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
      });
    }
  );

  /**
   * Get review by ID
   */
  static getReviewById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const review = await ReviewService.getReviewById(id, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review retrieved successfully',
        data: review,
      });
    }
  );

  /**
   * Update review
   */
  static updateReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const review = await ReviewService.updateReview(id, req.body, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    }
  );

  /**
   * Delete review
   */
  static deleteReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const result = await ReviewService.deleteReview(id, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  /**
   * Get member's reviews
   */
  static getMemberReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const user = req.user!;

      const result = await ReviewService.getMemberReviews(
        memberId,
        req.query,
        user
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
      });
    }
  );

  /**
   * Verify review (Admin only)
   */
  static verifyReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { isVerified } = req.body;
      const user = req.user!;

      const review = await ReviewService.verifyReview(id, isVerified, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Review ${isVerified ? 'verified' : 'unverified'} successfully`,
        data: review,
      });
    }
  );

  /**
   * Get all reviews (Admin only)
   */
  static getAllReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await ReviewService.getAllReviews(req.query);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
      });
    }
  );

  /**
   * Get trainer rating summary
   */
  static getTrainerRatingSummary = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { trainerId } = req.params;

      const summary = await ReviewService.getTrainerRatingSummary(trainerId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer rating summary retrieved successfully',
        data: summary,
      });
    }
  );
}