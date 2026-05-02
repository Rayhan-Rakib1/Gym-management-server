
import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '@prisma/client';
import { bookClassSchema, bookingIdParamSchema, getClassBookingsQuerySchema, getMemberBookingsQuerySchema } from './booking.validation';
import { BookingController } from './booking.controller';

const bookingRouter = Router();


// Book a class (Member only)
bookingRouter.post(
  '/',
  authenticate,
  authorize([Role.MEMBER]),
  validateRequest(bookClassSchema),
  BookingController.bookClass
);

// Get upcoming bookings (Member)
bookingRouter.get(
  '/upcoming',
  authenticate,
  authorize([Role.MEMBER]),
  BookingController.getUpcomingBookings
);

// Get member bookings
bookingRouter.get(
  '/member/:memberId',
  authenticate,
  authorize([Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getMemberBookingsQuerySchema),
  BookingController.getMemberBookings
);

// Get class bookings (Trainer/Admin)
bookingRouter.get(
  '/class/:classId',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getClassBookingsQuerySchema),
  BookingController.getClassBookings
);

// Get booking statistics (Admin/Trainer)
bookingRouter.get(
  '/class/:classId/stats',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  BookingController.getBookingStats
);

// Cancel booking (Member/Admin)
bookingRouter.patch(
  '/:id/cancel',
  authenticate,
  authorize([Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(bookingIdParamSchema),
  BookingController.cancelBooking
);

// Complete booking (Trainer/Admin)
bookingRouter.patch(
  '/:id/complete',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(bookingIdParamSchema),
  BookingController.completeBooking
);

export const BookingRoutes = bookingRouter;
