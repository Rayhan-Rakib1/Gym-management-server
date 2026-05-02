"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const client_1 = require("@prisma/client");
const booking_validation_1 = require("./booking.validation");
const booking_controller_1 = require("./booking.controller");
const bookingRouter = (0, express_1.Router)();
// Book a class (Member only)
bookingRouter.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER]), (0, validateRequest_1.validateRequest)(booking_validation_1.bookClassSchema), booking_controller_1.BookingController.bookClass);
// Get upcoming bookings (Member)
bookingRouter.get('/upcoming', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER]), booking_controller_1.BookingController.getUpcomingBookings);
// Get member bookings
bookingRouter.get('/member/:memberId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(booking_validation_1.getMemberBookingsQuerySchema), booking_controller_1.BookingController.getMemberBookings);
// Get class bookings (Trainer/Admin)
bookingRouter.get('/class/:classId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(booking_validation_1.getClassBookingsQuerySchema), booking_controller_1.BookingController.getClassBookings);
// Get booking statistics (Admin/Trainer)
bookingRouter.get('/class/:classId/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), booking_controller_1.BookingController.getBookingStats);
// Cancel booking (Member/Admin)
bookingRouter.patch('/:id/cancel', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(booking_validation_1.bookingIdParamSchema), booking_controller_1.BookingController.cancelBooking);
// Complete booking (Trainer/Admin)
bookingRouter.patch('/:id/complete', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(booking_validation_1.bookingIdParamSchema), booking_controller_1.BookingController.completeBooking);
exports.BookingRoutes = bookingRouter;
