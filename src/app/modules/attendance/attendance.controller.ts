import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { AttendanceService } from './attendance.service';
import { sendResponse } from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { AppError } from '../../errors/ApiError';

export class AttendanceController {
  /**
   * @route   POST /api/v1/attendance/check-in
   * @desc    Member check-in
   * @access  Member, Admin
   */
  static checkIn = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const attendance = await AttendanceService.checkIn(req.body);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Check-in successful! Welcome to the gym.',
        data: attendance,
      });
    }
  );

  /**
   * @route   POST /api/v1/attendance/check-out
   * @desc    Member check-out
   * @access  Member, Admin
   */
  static checkOut = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const attendance = await AttendanceService.checkOut(req.body);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Check-out successful! Great workout today.',
        data: attendance,
      });
    }
  );

  /**
   * @route   POST /api/v1/attendance/manual
   * @desc    Manual attendance entry
   * @access  Admin
   */
  static createManualAttendance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const createdBy = req.user?.id!;
      const attendance = await AttendanceService.createManualAttendance(
        req.body,
        createdBy
      );

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Attendance record created successfully',
        data: attendance,
      });
    }
  );

  /**
   * @route   GET /api/v1/attendance
   * @desc    Get all attendance
   * @access  Admin
   */
  static getAllAttendance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await AttendanceService.getAllAttendance(req.query as any);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Attendance records retrieved successfully',
        data: result.attendance,
        meta: result.pagination,
      });
    }
  );

  /**
   * @route   GET /api/v1/attendance/today
   * @desc    Get today's attendance
   * @access  Admin
   */
  static getTodayAttendance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await AttendanceService.getTodayAttendance();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Today's attendance retrieved successfully",
        data: result.attendance,
      });
    }
  );

  /**
   * @route   GET /api/v1/attendance/date/:date
   * @desc    Get attendance by date
   * @access  Admin
   */
  static getAttendanceByDate = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { date } = req.params;
      const attendance = await AttendanceService.getAttendanceByDate(date);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Attendance retrieved successfully',
        data: attendance,
      });
    }
  );

  /**
   * @route   GET /api/v1/attendance/member/:memberId
   * @desc    Get member attendance history
   * @access  Owner, Trainer, Admin
   */
  static getMemberAttendance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await AttendanceService.getMemberAttendance(
        memberId,
        page,
        limit
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member attendance retrieved successfully',
        data: result.attendance,
        meta: result.pagination,
      });
    }
  );

  /**
   * @route   GET /api/v1/attendance/stats
   * @desc    Get attendance statistics
   * @access  Admin
   */
  static getAttendanceStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await AttendanceService.getAttendanceStats(req.query as any);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Attendance statistics retrieved successfully',
        data: stats,
      });
    }
  );

  /**
   * @route   GET /api/v1/attendance/member/:memberId/rate
   * @desc    Get member attendance rate
   * @access  Owner, Trainer, Admin
   */
  static getMemberAttendanceRate = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const days = parseInt(req.query.days as string) || 30;

      const rate = await AttendanceService.getMemberAttendanceRate(memberId, days);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Attendance rate calculated successfully',
        data: rate,
      });
    }
  );

  /**
   * @route   DELETE /api/v1/attendance/:id
   * @desc    Delete attendance record
   * @access  Admin
   */
  static deleteAttendance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const deletedBy = req.user?.id!;

      const result = await AttendanceService.deleteAttendance(id, deletedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );
}