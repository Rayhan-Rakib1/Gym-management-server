"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const attendance_service_1 = require("./attendance.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
class AttendanceController {
}
exports.AttendanceController = AttendanceController;
_a = AttendanceController;
/**
 * @route   POST /api/v1/attendance/check-in
 * @desc    Member check-in
 * @access  Member, Admin
 */
AttendanceController.checkIn = (0, catchAsync_1.default)(async (req, res, next) => {
    const attendance = await attendance_service_1.AttendanceService.checkIn(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Check-in successful! Welcome to the gym.',
        data: attendance,
    });
});
/**
 * @route   POST /api/v1/attendance/check-out
 * @desc    Member check-out
 * @access  Member, Admin
 */
AttendanceController.checkOut = (0, catchAsync_1.default)(async (req, res, next) => {
    const attendance = await attendance_service_1.AttendanceService.checkOut(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Check-out successful! Great workout today.',
        data: attendance,
    });
});
/**
 * @route   POST /api/v1/attendance/manual
 * @desc    Manual attendance entry
 * @access  Admin
 */
AttendanceController.createManualAttendance = (0, catchAsync_1.default)(async (req, res, next) => {
    const createdBy = req.user?.id;
    const attendance = await attendance_service_1.AttendanceService.createManualAttendance(req.body, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Attendance record created successfully',
        data: attendance,
    });
});
/**
 * @route   GET /api/v1/attendance
 * @desc    Get all attendance
 * @access  Admin
 */
AttendanceController.getAllAttendance = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await attendance_service_1.AttendanceService.getAllAttendance(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Attendance records retrieved successfully',
        data: result.attendance,
        meta: result.pagination,
    });
});
/**
 * @route   GET /api/v1/attendance/today
 * @desc    Get today's attendance
 * @access  Admin
 */
AttendanceController.getTodayAttendance = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await attendance_service_1.AttendanceService.getTodayAttendance();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Today's attendance retrieved successfully",
        data: result.attendance,
    });
});
/**
 * @route   GET /api/v1/attendance/date/:date
 * @desc    Get attendance by date
 * @access  Admin
 */
AttendanceController.getAttendanceByDate = (0, catchAsync_1.default)(async (req, res, next) => {
    const { date } = req.params;
    const attendance = await attendance_service_1.AttendanceService.getAttendanceByDate(date);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Attendance retrieved successfully',
        data: attendance,
    });
});
/**
 * @route   GET /api/v1/attendance/member/:memberId
 * @desc    Get member attendance history
 * @access  Owner, Trainer, Admin
 */
AttendanceController.getMemberAttendance = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await attendance_service_1.AttendanceService.getMemberAttendance(memberId, page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member attendance retrieved successfully',
        data: result.attendance,
        meta: result.pagination,
    });
});
/**
 * @route   GET /api/v1/attendance/stats
 * @desc    Get attendance statistics
 * @access  Admin
 */
AttendanceController.getAttendanceStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const stats = await attendance_service_1.AttendanceService.getAttendanceStats(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Attendance statistics retrieved successfully',
        data: stats,
    });
});
/**
 * @route   GET /api/v1/attendance/member/:memberId/rate
 * @desc    Get member attendance rate
 * @access  Owner, Trainer, Admin
 */
AttendanceController.getMemberAttendanceRate = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const days = parseInt(req.query.days) || 30;
    const rate = await attendance_service_1.AttendanceService.getMemberAttendanceRate(memberId, days);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Attendance rate calculated successfully',
        data: rate,
    });
});
/**
 * @route   DELETE /api/v1/attendance/:id
 * @desc    Delete attendance record
 * @access  Admin
 */
AttendanceController.deleteAttendance = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    const result = await attendance_service_1.AttendanceService.deleteAttendance(id, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
