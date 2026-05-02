// src/modules/progress/progress.controller.ts

import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ProgressService } from './progress.service';
import catchAsync from '../../../utils/catchAsync';
import { sendResponse } from '../../../utils/sendResponse';

export class ProgressController {

  static createBodyMetric = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const createdBy = req.user?.id!;
      const bodyMetric = await ProgressService.createBodyMetric(
        req.body,
        createdBy
      );

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Body metric recorded successfully',
        data: bodyMetric,
      });
    }
  );

  static getMemberMetrics = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const filters = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await ProgressService.getMemberMetrics(
        memberId,
        filters,
        userId,
        userRole
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member metrics retrieved successfully',
        data: result.metrics,
        meta: result.pagination,
      });
    }
  );

  static getMetricById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const metric = await ProgressService.getMetricById(id, userId, userRole);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Body metric retrieved successfully',
        data: metric,
      });
    }
  );

  static updateBodyMetric = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const updatedBy = req.user?.id!;

      const updatedMetric = await ProgressService.updateBodyMetric(
        id,
        req.body,
        userId,
        userRole,
        updatedBy
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Body metric updated successfully',
        data: updatedMetric,
      });
    }
  );

  static deleteBodyMetric = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const deletedBy = req.user?.id!;

      const result = await ProgressService.deleteBodyMetric(
        id,
        userId,
        userRole,
        deletedBy
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  static getLatestMetric = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const metric = await ProgressService.getLatestMetric(
        memberId,
        userId,
        userRole
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: metric
          ? 'Latest metric retrieved successfully'
          : 'No metrics found',
        data: metric,
      });
    }
  );

  // ============================================
  // PROGRESS PHOTOS CONTROLLERS
  // ============================================

  static uploadProgressPhoto = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const uploadedBy = req.user?.id!;
      const progressPhoto = await ProgressService.uploadProgressPhoto(
        req.body,
        uploadedBy
      );

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Progress photo uploaded successfully',
        data: progressPhoto,
      });
    }
  );

  static getMemberPhotos = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const filters = {
        photoType: req.query.photoType as any,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await ProgressService.getMemberPhotos(
        memberId,
        filters,
        userId,
        userRole
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Progress photos retrieved successfully',
        data: result.photos,
        meta: result.pagination,
      });
    }
  );

  static getPhotoById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const photo = await ProgressService.getPhotoById(id, userId, userRole);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Progress photo retrieved successfully',
        data: photo,
      });
    }
  );

  static deleteProgressPhoto = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const deletedBy = req.user?.id!;

      const result = await ProgressService.deleteProgressPhoto(
        id,
        userId,
        userRole,
        deletedBy
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  // ============================================
  // ANALYTICS & COMPARISON CONTROLLERS
  // ============================================

  static compareMetrics = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const { startDate, endDate } = req.query;

      const comparison = await ProgressService.compareMetrics(
        memberId,
        new Date(startDate as string),
        new Date(endDate as string),
        userId,
        userRole
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Metrics comparison retrieved successfully',
        data: comparison,
      });
    }
  );

  static getProgressSummary = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const summary = await ProgressService.getProgressSummary(
        memberId,
        userId,
        userRole
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Progress summary retrieved successfully',
        data: summary,
      });
    }
  );

  static calculateBMI = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { weight, height } = req.body;

      const result = ProgressService.calculateBMIPublic(weight, height);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'BMI calculated successfully',
        data: result,
      });
    }
  );
}