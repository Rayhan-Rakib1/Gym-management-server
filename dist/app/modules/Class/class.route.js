"use strict";
// src/modules/class/class.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const class_validation_1 = require("./class.validation");
const client_1 = require("@prisma/client");
const class_controller_1 = require("./class.controller");
const router = (0, express_1.Router)();
// CLASS ROUTES
// Get all classes (Public with optional filters)
router.get('/', (0, validateRequest_1.validateRequest)(class_validation_1.getClassesQuerySchema), class_controller_1.ClassController.getAllClasses);
// Get active classes only (Public)
router.get('/active', class_controller_1.ClassController.getActiveClasses);
// Get class statistics (Admin only)
router.get('/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), class_controller_1.ClassController.getClassStats);
// Create class (Admin only)
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(class_validation_1.createClassSchema), class_controller_1.ClassController.createClass);
// Get trainer's classes (Public)
router.get('/trainer/:trainerId', class_controller_1.ClassController.getTrainerClasses);
// Get class by ID (Public)
router.get('/:id', class_controller_1.ClassController.getClassById);
// Update class (Admin or Trainer owner)
router.put('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TRAINER]), (0, validateRequest_1.validateRequest)(class_validation_1.updateClassSchema), class_controller_1.ClassController.updateClass);
// Toggle class status (Admin only)
router.patch('/:id/toggle-status', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), class_controller_1.ClassController.toggleClassStatus);
// Delete class (Admin only)
router.delete('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), class_controller_1.ClassController.deleteClass);
// SCHEDULE ROUTES
// Get class schedules (Public)
router.get('/:id/schedules', class_controller_1.ClassController.getClassSchedules);
// Create schedule (Admin or Trainer owner)
router.post('/:classId/schedules', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TRAINER]), (0, validateRequest_1.validateRequest)(class_validation_1.createScheduleSchema), class_controller_1.ClassController.createClassSchedule);
// Update schedule (Admin or Trainer owner)
router.put('/:classId/schedules/:scheduleId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TRAINER]), (0, validateRequest_1.validateRequest)(class_validation_1.updateScheduleSchema), class_controller_1.ClassController.updateClassSchedule);
// Delete schedule (Admin or Trainer owner)
router.delete('/:classId/schedules/:scheduleId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TRAINER]), class_controller_1.ClassController.deleteClassSchedule);
exports.ClassRoutes = router;
