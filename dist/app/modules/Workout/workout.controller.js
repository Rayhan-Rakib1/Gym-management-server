"use strict";
// src/modules/workoutPlan/workoutPlan.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = require("../../../utils/sendResponse");
const workout_service_1 = require("./workout.service");
class WorkoutPlanController {
}
exports.WorkoutPlanController = WorkoutPlanController;
_a = WorkoutPlanController;
/**
 * Create workout plan
 */
WorkoutPlanController.createWorkoutPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user;
    const workoutPlan = await workout_service_1.WorkoutPlanService.createWorkoutPlan(req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Workout plan created successfully',
        data: workoutPlan,
    });
});
/**
 * Get all workout plans (Admin only)
 */
WorkoutPlanController.getAllWorkoutPlans = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await workout_service_1.WorkoutPlanService.getAllWorkoutPlans(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Workout plans retrieved successfully',
        data: result.workoutPlans,
        meta: result.pagination,
    });
});
/**
 * Get workout plan by ID
 */
WorkoutPlanController.getWorkoutPlanById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const workoutPlan = await workout_service_1.WorkoutPlanService.getWorkoutPlanById(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Workout plan retrieved successfully',
        data: workoutPlan,
    });
});
/**
 * Update workout plan
 */
WorkoutPlanController.updateWorkoutPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const workoutPlan = await workout_service_1.WorkoutPlanService.updateWorkoutPlan(id, req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Workout plan updated successfully',
        data: workoutPlan,
    });
});
/**
 * Delete workout plan
 */
WorkoutPlanController.deleteWorkoutPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const result = await workout_service_1.WorkoutPlanService.deleteWorkoutPlan(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
/**
 * Get member's workout plans
 */
WorkoutPlanController.getMemberWorkoutPlans = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const user = req.user;
    const result = await workout_service_1.WorkoutPlanService.getMemberWorkoutPlans(memberId, req.query, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member workout plans retrieved successfully',
        data: result.workoutPlans,
        meta: result.pagination,
    });
});
/**
 * Get trainer's workout plans
 */
WorkoutPlanController.getTrainerWorkoutPlans = (0, catchAsync_1.default)(async (req, res, next) => {
    const { trainerId } = req.params;
    const user = req.user;
    const result = await workout_service_1.WorkoutPlanService.getTrainerWorkoutPlans(trainerId, req.query, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer workout plans retrieved successfully',
        data: result.workoutPlans,
        meta: result.pagination,
    });
});
/**
 * Add exercise to plan
 */
WorkoutPlanController.addExercise = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const exercise = await workout_service_1.WorkoutPlanService.addExercise(id, req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Exercise added successfully',
        data: exercise,
    });
});
/**
 * Update exercise
 */
WorkoutPlanController.updateExercise = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id, exerciseId } = req.params;
    const user = req.user;
    const exercise = await workout_service_1.WorkoutPlanService.updateExercise(id, exerciseId, req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Exercise updated successfully',
        data: exercise,
    });
});
/**
 * Delete exercise
 */
WorkoutPlanController.deleteExercise = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id, exerciseId } = req.params;
    const user = req.user;
    const result = await workout_service_1.WorkoutPlanService.deleteExercise(id, exerciseId, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
/**
 * Add or Update diet plan
 */
WorkoutPlanController.addOrUpdateDietPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const dietPlan = await workout_service_1.WorkoutPlanService.addOrUpdateDietPlan(id, req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Diet plan saved successfully',
        data: dietPlan,
    });
});
/**
 * Get diet plan
 */
WorkoutPlanController.getDietPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const dietPlan = await workout_service_1.WorkoutPlanService.getDietPlan(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Diet plan retrieved successfully',
        data: dietPlan,
    });
});
/**
 * Toggle workout plan status
 */
WorkoutPlanController.toggleWorkoutPlanStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const workoutPlan = await workout_service_1.WorkoutPlanService.toggleWorkoutPlanStatus(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Workout plan ${workoutPlan.isActive ? 'activated' : 'deactivated'} successfully`,
        data: workoutPlan,
    });
});
