"use strict";
// src/modules/workoutPlan/workoutPlan.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const client_1 = require("@prisma/client");
const workout_validation_1 = require("./workout.validation");
const workout_controller_1 = require("./workout.controller");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/workout-plans
 * @desc    Create workout plan
 * @access  Trainer, Admin, Super Admin
 */
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.createWorkoutPlanSchema), workout_controller_1.WorkoutPlanController.createWorkoutPlan);
/**
 * @route   GET /api/v1/workout-plans
 * @desc    Get all workout plans (Admin only)
 * @access  Admin, Super Admin
 */
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.getWorkoutPlansQuerySchema), workout_controller_1.WorkoutPlanController.getAllWorkoutPlans);
/**
 * @route   GET /api/v1/workout-plans/member/:memberId
 * @desc    Get member's workout plans
 * @access  Owner, Trainer, Admin, Super Admin
 */
router.get('/member/:memberId', auth_1.authenticate, (0, validateRequest_1.validateRequest)(workout_validation_1.getMemberWorkoutPlansSchema), workout_controller_1.WorkoutPlanController.getMemberWorkoutPlans);
/**
 * @route   GET /api/v1/workout-plans/trainer/:trainerId
 * @desc    Get trainer's workout plans
 * @access  Owner, Admin, Super Admin
 */
router.get('/trainer/:trainerId', auth_1.authenticate, (0, validateRequest_1.validateRequest)(workout_validation_1.getTrainerWorkoutPlansSchema), workout_controller_1.WorkoutPlanController.getTrainerWorkoutPlans);
/**
 * @route   GET /api/v1/workout-plans/:id
 * @desc    Get workout plan by ID
 * @access  Owner, Trainer, Admin, Super Admin
 */
router.get('/:id', auth_1.authenticate, (0, validateRequest_1.validateRequest)(workout_validation_1.getWorkoutPlanByIdSchema), workout_controller_1.WorkoutPlanController.getWorkoutPlanById);
/**
 * @route   PUT /api/v1/workout-plans/:id
 * @desc    Update workout plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.put('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.updateWorkoutPlanSchema), workout_controller_1.WorkoutPlanController.updateWorkoutPlan);
/**
 * @route   DELETE /api/v1/workout-plans/:id
 * @desc    Delete workout plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.delete('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.deleteWorkoutPlanSchema), workout_controller_1.WorkoutPlanController.deleteWorkoutPlan);
/**
 * @route   POST /api/v1/workout-plans/:id/exercises
 * @desc    Add exercise to plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.post('/:id/exercises', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.addExerciseSchema), workout_controller_1.WorkoutPlanController.addExercise);
/**
 * @route   PUT /api/v1/workout-plans/:id/exercises/:exerciseId
 * @desc    Update exercise
 * @access  Trainer (creator), Admin, Super Admin
 */
router.put('/:id/exercises/:exerciseId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.updateExerciseSchema), workout_controller_1.WorkoutPlanController.updateExercise);
/**
 * @route   DELETE /api/v1/workout-plans/:id/exercises/:exerciseId
 * @desc    Delete exercise
 * @access  Trainer (creator), Admin, Super Admin
 */
router.delete('/:id/exercises/:exerciseId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.deleteExerciseSchema), workout_controller_1.WorkoutPlanController.deleteExercise);
/**
 * @route   POST /api/v1/workout-plans/:id/diet
 * @desc    Add/Update diet plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.post('/:id/diet', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.addOrUpdateDietSchema), workout_controller_1.WorkoutPlanController.addOrUpdateDietPlan);
/**
 * @route   GET /api/v1/workout-plans/:id/diet
 * @desc    Get diet plan
 * @access  Owner, Trainer, Admin, Super Admin
 */
router.get('/:id/diet', auth_1.authenticate, (0, validateRequest_1.validateRequest)(workout_validation_1.getDietPlanSchema), workout_controller_1.WorkoutPlanController.getDietPlan);
/**
 * @route   PATCH /api/v1/workout-plans/:id/toggle-status
 * @desc    Activate/Deactivate plan
 * @access  Trainer (creator), Admin, Super Admin
 */
router.patch('/:id/toggle-status', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.TRAINER, client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(workout_validation_1.toggleWorkoutPlanStatusSchema), workout_controller_1.WorkoutPlanController.toggleWorkoutPlanStatus);
exports.WorkoutPlanRoutes = router;
