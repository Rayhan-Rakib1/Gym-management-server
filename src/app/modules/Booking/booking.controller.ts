
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { BookingService } from './booking.service';
import { sendResponse } from '../../../utils/sendResponse';

export class BookingController {

  static bookClass = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id!;
      const bookingData = {
        ...req.body,
        userId,
      };

      const booking = await BookingService.bookClass(bookingData);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message:
          booking.status === 'CONFIRMED'
            ? 'Class booked successfully'
            : 'Added to waitlist successfully',
        data: booking,
      });
    }
  );

  static getMemberBookings = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const filters = {
        status: req.query.status as any,
        upcoming: req.query.upcoming === 'true',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await BookingService.getMemberBookings(
        memberId,
        filters,
        userId,
        userRole
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member bookings retrieved successfully',
        data: result.bookings,
        meta: result.pagination,
      });
    }
  );

  static getClassBookings = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { classId } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const filters = {
        date: req.query.date ? new Date(req.query.date as string) : undefined,
        status: req.query.status as any,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await BookingService.getClassBookings(
        classId,
        filters,
        userId,
        userRole
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Class bookings retrieved successfully',
        data: result.bookings,
        meta: result.pagination,
      });
    }
  );

  static cancelBooking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const booking = await BookingService.cancelBooking(id, userId, userRole);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    }
  );

  static completeBooking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const completedBy = req.user?.id!;

      const booking = await BookingService.completeBooking(id, completedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Booking marked as completed',
        data: booking,
      });
    }
  );

  static getUpcomingBookings = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id!;

      const bookings = await BookingService.getUpcomingBookings(userId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Upcoming bookings retrieved successfully',
        data: bookings,
      });
    }
  );

  static getBookingStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { classId } = req.params;

      const stats = await BookingService.getBookingStats(classId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Booking statistics retrieved successfully',
        data: stats,
      });
    }
  );
}