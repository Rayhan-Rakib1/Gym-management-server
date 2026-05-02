// src/modules/workoutPlan/workoutPlan.routes.ts

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '@prisma/client';
import {
  createWorkoutPlanSchema,
  getWorkoutPlansQuerySchema,
  getWorkoutPlanByIdSchema,
  updateWorkoutPlanSchema,
  deleteWorkoutPlanSchema,
  getMemberWorkoutPlansSchema,
  getTrainerWorkoutPlansSchema,
  addExerciseSchema,
  updateExerciseSchema,
  deleteExerciseSchema,
  addOrUpdateDietSchema,
  getDietPlanSchema,
  toggleWorkoutPlanStatusSchema,
} from './workout.validation';
import { WorkoutPlanController } from './workout.controller';

const router = Router();

/**
 * @route   POST /api/v1/workout-plans
 * @desc    Create workout plan
 * @access  Trainer, Admin, Super Admin
 */
router.post(
  '/',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(createWorkoutPlanSchema),
  WorkoutPlanController.createWorkoutPlan
);

/**
 * @route   GET /api/v1/workout-plans
 * @desc    Get all workout plans (Admin only)
 * @access  Admin, Super Admin
 */
router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getWorkoutPlansQuerySchema),
  WorkoutPlanController.getAllWorkoutPlans
);

/**
 * @route   GET /api/v1/workout-plans/member/:memberId
 * @desc    Get member's workout plans
 * @access  Owner, Trainer, Admin, Super Admin
 */
router.get(
  '/member/:memberId',
  authenticate,
  validateRequest(getMemberWorkoutPlansSchema),
  WorkoutPlanController.getMemberWorkoutPlans
);

/**
 * @route   GET /api/v1/workout-plans/trainer/:trainerId
 * @desc    Get trainer's workout plans
 * @access  Owner, Admin, Super Admin
 */
router.get(
  '/trainer/:trainerId',
  authenticate,
  validateRequest(getTrainerWorkoutPlansSchema),
  WorkoutPlanController.getTrainerWorkoutPlans
);

/**
 * @route   GET /api/v1/workout-plans/:id
 * @desc    Get workout plan by ID
 * @access  Owner, Trainer, Admin, Super Admin
 */
router.get(
  '/:id',
  authenticate,
  validateRequest(getWorkoutPlanByIdSchema),
  WorkoutPlanController.getWorkoutPlanById
);

/**
 * @route   PUT /api/v1/workout-plans/:id
 * @desc    Update workout plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(updateWorkoutPlanSchema),
  WorkoutPlanController.updateWorkoutPlan
);

/**
 * @route   DELETE /api/v1/workout-plans/:id
 * @desc    Delete workout plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(deleteWorkoutPlanSchema),
  WorkoutPlanController.deleteWorkoutPlan
);

/**
 * @route   POST /api/v1/workout-plans/:id/exercises
 * @desc    Add exercise to plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.post(
  '/:id/exercises',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(addExerciseSchema),
  WorkoutPlanController.addExercise
);

/**
 * @route   PUT /api/v1/workout-plans/:id/exercises/:exerciseId
 * @desc    Update exercise
 * @access  Trainer (creator), Admin, Super Admin
 */
router.put(
  '/:id/exercises/:exerciseId',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(updateExerciseSchema),
  WorkoutPlanController.updateExercise
);

/**
 * @route   DELETE /api/v1/workout-plans/:id/exercises/:exerciseId
 * @desc    Delete exercise
 * @access  Trainer (creator), Admin, Super Admin
 */
router.delete(
  '/:id/exercises/:exerciseId',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(deleteExerciseSchema),
  WorkoutPlanController.deleteExercise
);

/**
 * @route   POST /api/v1/workout-plans/:id/diet
 * @desc    Add/Update diet plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.post(
  '/:id/diet',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(addOrUpdateDietSchema),
  WorkoutPlanController.addOrUpdateDietPlan
);

/**
 * @route   GET /api/v1/workout-plans/:id/diet
 * @desc    Get diet plan
 * @access  Owner, Trainer, Admin, Super Admin
 */
router.get(
  '/:id/diet',
  authenticate,
  validateRequest(getDietPlanSchema),
  WorkoutPlanController.getDietPlan
);

/**
 * @route   PATCH /api/v1/workout-plans/:id/toggle-status
 * @desc    Activate/Deactivate plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.patch(
  '/:id/toggle-status',
  authenticate,
  authorize([Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(toggleWorkoutPlanStatusSchema),
  WorkoutPlanController.toggleWorkoutPlanStatus
);

export const WorkoutPlanRoutes = router;