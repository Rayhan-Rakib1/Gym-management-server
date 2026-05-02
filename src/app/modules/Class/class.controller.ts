// src/modules/class/class.controller.ts

import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ClassService } from './class.service';
import catchAsync from '../../../utils/catchAsync';
import { sendResponse } from '../../../utils/sendResponse';

export class ClassController {

  static createClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const createdBy = req.user?.id!;
      const classData = await ClassService.createClass(req.body, createdBy);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Class created successfully',
        data: classData,
      });
    }
  );

  static getAllClasses = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await ClassService.getAllClasses(req.query as any);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Classes retrieved successfully',
        data: result.classes,
        meta: result.pagination,
      });
    }
  );

  static getActiveClasses = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const classes = await ClassService.getActiveClasses();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Active classes retrieved successfully',
        data: classes,
      });
    }
  );

  static getClassById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const classData = await ClassService.getClassById(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Class retrieved successfully',
        data: classData,
      });
    }
  );

  static updateClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const updatedBy = req.user?.id!;

      const updatedClass = await ClassService.updateClass(
        id,
        req.body,
        userId,
        userRole,
        updatedBy
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Class updated successfully',
        data: updatedClass,
      });
    }
  );

  static deleteClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const deletedBy = req.user?.id!;
      const result = await ClassService.deleteClass(id, deletedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  static toggleClassStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updatedBy = req.user?.id!;
      const updatedClass = await ClassService.toggleClassStatus(id, updatedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Class ${updatedClass.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedClass,
      });
    }
  );

  static getTrainerClasses = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { trainerId } = req.params;
      const classes = await ClassService.getTrainerClasses(trainerId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer classes retrieved successfully',
        data: classes,
      });
    }
  );

  static getClassStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await ClassService.getClassStats();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Class statistics retrieved successfully',
        data: stats,
      });
    }
  );

  // ============================================
  // SCHEDULE CONTROLLERS
  // ============================================

  static getClassSchedules = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const schedules = await ClassService.getClassSchedules(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Class schedules retrieved successfully',
        data: schedules,
      });
    }
  );

  static createClassSchedule = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { classId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const createdBy = req.user?.id!;

      const schedule = await ClassService.createClassSchedule(
        classId,
        req.body,
        userId,
        userRole,
        createdBy
      );

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Class schedule created successfully',
        data: schedule,
      });
    }
  );

  static updateClassSchedule = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { classId, scheduleId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const updatedBy = req.user?.id!;

      const updatedSchedule = await ClassService.updateClassSchedule(
        classId,
        scheduleId,
        req.body,
        userId,
        userRole,
        updatedBy
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Class schedule updated successfully',
        data: updatedSchedule,
      });
    }
  );

  static deleteClassSchedule = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { classId, scheduleId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const deletedBy = req.user?.id!;

      const result = await ClassService.deleteClassSchedule(
        classId,
        scheduleId,
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
}