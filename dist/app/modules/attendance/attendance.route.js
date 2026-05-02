"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRoutes = void 0;
const express_1 = require("express");
const attendance_controller_1 = require("./attendance.controller");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const attendance_validation_1 = require("./attendance.validation");
const client_1 = require("@prisma/client");
const checkOwnerShip_1 = require("../../middlewares/checkOwnerShip");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/attendance/check-in
 * @desc    Member check-in
 * @access  Member, Admin
 */
router.post('/check-in', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(attendance_validation_1.checkInSchema), attendance_controller_1.AttendanceController.checkIn);
/**
 * @route   POST /api/v1/attendance/check-out
 * @desc    Member check-out
 * @access  Member, Admin
 */
router.post('/check-out', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.MEMBER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(attendance_validation_1.checkOutSchema), attendance_controller_1.AttendanceController.checkOut);
/**
 * @route   POST /api/v1/attendance/manual
 * @desc    Manual attendance entry
 * @access  Admin
 */
router.post('/manual', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(attendance_validation_1.manualAttendanceSchema), attendance_controller_1.AttendanceController.createManualAttendance);
/**
 * @route   GET /api/v1/attendance
 * @desc    Get all attendance
 * @access  Admin
 */
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(attendance_validation_1.getAttendanceQuerySchema), attendance_controller_1.AttendanceController.getAllAttendance);
/**
 * @route   GET /api/v1/attendance/today
 * @desc    Get today's attendance
 * @access  Admin
 */
router.get('/today', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), attendance_controller_1.AttendanceController.getTodayAttendance);
/**
 * @route   GET /api/v1/attendance/stats
 * @desc    Get attendance statistics
 * @access  Admin
 */
router.get('/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(attendance_validation_1.getAttendanceStatsSchema), attendance_controller_1.AttendanceController.getAttendanceStats);
/**
 * @route   GET /api/v1/attendance/date/:date
 * @desc    Get attendance by date
 * @access  Admin
 */
router.get('/date/:date', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), attendance_controller_1.AttendanceController.getAttendanceByDate);
/**
 * @route   GET /api/v1/attendance/member/:memberId
 * @desc    Get member attendance history
 * @access  Owner, Trainer, Admin
 */
router.get('/member/:memberId', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)('member'), attendance_controller_1.AttendanceController.getMemberAttendance);
/**
 * @route   GET /api/v1/attendance/member/:memberId/rate
 * @desc    Get member attendance rate
 * @access  Owner, Trainer, Admin
 */
router.get('/member/:memberId/rate', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)('member'), attendance_controller_1.AttendanceController.getMemberAttendanceRate);
/**
 * @route   DELETE /api/v1/attendance/:id
 * @desc    Delete attendance record
 * @access  Admin
 */
router.delete('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), attendance_controller_1.AttendanceController.deleteAttendance);
exports.attendanceRoutes = router;
