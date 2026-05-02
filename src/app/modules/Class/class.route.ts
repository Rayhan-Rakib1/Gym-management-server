// src/modules/class/class.routes.ts

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createClassSchema,
  updateClassSchema,
  getClassesQuerySchema,
  createScheduleSchema,
  updateScheduleSchema,
} from './class.validation';
import { Role } from '@prisma/client';
import { ClassController } from './class.controller';

const router = Router();

// CLASS ROUTES
// Get all classes (Public with optional filters)
router.get(
  '/',
  validateRequest(getClassesQuerySchema),
  ClassController.getAllClasses
);

// Get active classes only (Public)
router.get('/active', ClassController.getActiveClasses);

// Get class statistics (Admin only)
router.get(
  '/stats',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  ClassController.getClassStats
);

// Create class (Admin only)
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(createClassSchema),
  ClassController.createClass
);

// Get trainer's classes (Public)
router.get('/trainer/:trainerId', ClassController.getTrainerClasses);

// Get class by ID (Public)
router.get('/:id', ClassController.getClassById);

// Update class (Admin or Trainer owner)
router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER]),
  validateRequest(updateClassSchema),
  ClassController.updateClass
);

// Toggle class status (Admin only)
router.patch(
  '/:id/toggle-status',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  ClassController.toggleClassStatus
);

// Delete class (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  ClassController.deleteClass
);


// SCHEDULE ROUTES
// Get class schedules (Public)
router.get('/:id/schedules', ClassController.getClassSchedules);

// Create schedule (Admin or Trainer owner)
router.post(
  '/:classId/schedules',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER]),
  validateRequest(createScheduleSchema),
  ClassController.createClassSchedule
);

// Update schedule (Admin or Trainer owner)
router.put(
  '/:classId/schedules/:scheduleId',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER]),
  validateRequest(updateScheduleSchema),
  ClassController.updateClassSchedule
);

// Delete schedule (Admin or Trainer owner)
router.delete(
  '/:classId/schedules/:scheduleId',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER]),
  ClassController.deleteClassSchedule
);

export const ClassRoutes = router;
