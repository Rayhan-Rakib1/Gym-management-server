"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const booking_service_1 = require("./booking.service");
const sendResponse_1 = require("../../../utils/sendResponse");
class BookingController {
}
exports.BookingController = BookingController;
_a = BookingController;
BookingController.bookClass = (0, catchAsync_1.default)(async (req, res, next) => {
    const userId = req.user?.id;
    const bookingData = {
        ...req.body,
        userId,
    };
    const booking = await booking_service_1.BookingService.bookClass(bookingData);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: booking.status === 'CONFIRMED'
            ? 'Class booked successfully'
            : 'Added to waitlist successfully',
        data: booking,
    });
});
BookingController.getMemberBookings = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const filters = {
        status: req.query.status,
        upcoming: req.query.upcoming === 'true',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
    };
    const result = await booking_service_1.BookingService.getMemberBookings(memberId, filters, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member bookings retrieved successfully',
        data: result.bookings,
        meta: result.pagination,
    });
});
BookingController.getClassBookings = (0, catchAsync_1.default)(async (req, res, next) => {
    const { classId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const filters = {
        date: req.query.date ? new Date(req.query.date) : undefined,
        status: req.query.status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
    };
    const result = await booking_service_1.BookingService.getClassBookings(classId, filters, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class bookings retrieved successfully',
        data: result.bookings,
        meta: result.pagination,
    });
});
BookingController.cancelBooking = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const booking = await booking_service_1.BookingService.cancelBooking(id, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
    });
});
BookingController.completeBooking = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const completedBy = req.user?.id;
    const booking = await booking_service_1.BookingService.completeBooking(id, completedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking marked as completed',
        data: booking,
    });
});
BookingController.getUpcomingBookings = (0, catchAsync_1.default)(async (req, res, next) => {
    const userId = req.user?.id;
    const bookings = await booking_service_1.BookingService.getUpcomingBookings(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Upcoming bookings retrieved successfully',
        data: bookings,
    });
});
BookingController.getBookingStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const { classId } = req.params;
    const stats = await booking_service_1.BookingService.getBookingStats(classId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking statistics retrieved successfully',
        data: stats,
    });
});
