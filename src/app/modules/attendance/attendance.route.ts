import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { checkInSchema, checkOutSchema, getAttendanceQuerySchema, getAttendanceStatsSchema, manualAttendanceSchema } from './attendance.validation';
import { Role } from '@prisma/client';
import { checkOwnership } from '../../middlewares/checkOwnerShip';

const router = Router();

/**
 * @route   POST /api/v1/attendance/check-in
 * @desc    Member check-in
 * @access  Member, Admin
 */
router.post(
  '/check-in',
  authenticate,
  authorize([Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(checkInSchema),
  AttendanceController.checkIn
);

/**
 * @route   POST /api/v1/attendance/check-out
 * @desc    Member check-out
 * @access  Member, Admin
 */
router.post(
  '/check-out',
  authenticate,
  authorize([Role.MEMBER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(checkOutSchema),
  AttendanceController.checkOut
);

/**
 * @route   POST /api/v1/attendance/manual
 * @desc    Manual attendance entry
 * @access  Admin
 */
router.post(
  '/manual',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(manualAttendanceSchema),
  AttendanceController.createManualAttendance
);

/**
 * @route   GET /api/v1/attendance
 * @desc    Get all attendance
 * @access  Admin
 */
router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getAttendanceQuerySchema),
  AttendanceController.getAllAttendance
);

/**
 * @route   GET /api/v1/attendance/today
 * @desc    Get today's attendance
 * @access  Admin
 */
router.get(
  '/today',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  AttendanceController.getTodayAttendance
);

/**
 * @route   GET /api/v1/attendance/stats
 * @desc    Get attendance statistics
 * @access  Admin
 */
router.get(
  '/stats',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getAttendanceStatsSchema),
  AttendanceController.getAttendanceStats
);

/**
 * @route   GET /api/v1/attendance/date/:date
 * @desc    Get attendance by date
 * @access  Admin
 */
router.get(
  '/date/:date',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  AttendanceController.getAttendanceByDate
);

/**
 * @route   GET /api/v1/attendance/member/:memberId
 * @desc    Get member attendance history
 * @access  Owner, Trainer, Admin
 */
router.get(
  '/member/:memberId',
  authenticate,
  checkOwnership('member'),
  AttendanceController.getMemberAttendance
);

/**
 * @route   GET /api/v1/attendance/member/:memberId/rate
 * @desc    Get member attendance rate
 * @access  Owner, Trainer, Admin
 */
router.get(
  '/member/:memberId/rate',
  authenticate,
  checkOwnership('member'),
  AttendanceController.getMemberAttendanceRate
);

/**
 * @route   DELETE /api/v1/attendance/:id
 * @desc    Delete attendance record
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  AttendanceController.deleteAttendance
);

export const attendanceRoutes = router;