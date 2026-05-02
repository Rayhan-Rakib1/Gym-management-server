// src/modules/workoutPlan/workoutPlan.controller.ts

import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { sendResponse } from '../../../utils/sendResponse';
import { WorkoutPlanService } from './workout.service';

export class WorkoutPlanController {
  /**
   * Create workout plan
   */
  static createWorkoutPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user!;
      const workoutPlan = await WorkoutPlanService.createWorkoutPlan(req.body, user);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Workout plan created successfully',
        data: workoutPlan,
      });
    }
  );

  /**
   * Get all workout plans (Admin only)
   */
  static getAllWorkoutPlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await WorkoutPlanService.getAllWorkoutPlans(req.query);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Workout plans retrieved successfully',
        data: result.workoutPlans,
        meta: result.pagination,
      });
    }
  );

  /**
   * Get workout plan by ID
   */
  static getWorkoutPlanById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const workoutPlan = await WorkoutPlanService.getWorkoutPlanById(id, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Workout plan retrieved successfully',
        data: workoutPlan,
      });
    }
  );

  /**
   * Update workout plan
   */
  static updateWorkoutPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const workoutPlan = await WorkoutPlanService.updateWorkoutPlan(id, req.body, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Workout plan updated successfully',
        data: workoutPlan,
      });
    }
  );

  /**
   * Delete workout plan
   */
  static deleteWorkoutPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const result = await WorkoutPlanService.deleteWorkoutPlan(id, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  /**
   * Get member's workout plans
   */
  static getMemberWorkoutPlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { memberId } = req.params;
      const user = req.user!;

      const result = await WorkoutPlanService.getMemberWorkoutPlans(
        memberId,
        req.query,
        user
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Member workout plans retrieved successfully',
        data: result.workoutPlans,
        meta: result.pagination,
      });
    }
  );

  /**
   * Get trainer's workout plans
   */
  static getTrainerWorkoutPlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { trainerId } = req.params;
      const user = req.user!;

      const result = await WorkoutPlanService.getTrainerWorkoutPlans(
        trainerId,
        req.query,
        user
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer workout plans retrieved successfully',
        data: result.workoutPlans,
        meta: result.pagination,
      });
    }
  );

  /**
   * Add exercise to plan
   */
  static addExercise = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const exercise = await WorkoutPlanService.addExercise(id, req.body, user);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Exercise added successfully',
        data: exercise,
      });
    }
  );

  /**
   * Update exercise
   */
  static updateExercise = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id, exerciseId } = req.params;
      const user = req.user!;

      const exercise = await WorkoutPlanService.updateExercise(
        id,
        exerciseId,
        req.body,
        user
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Exercise updated successfully',
        data: exercise,
      });
    }
  );

  /**
   * Delete exercise
   */
  static deleteExercise = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id, exerciseId } = req.params;
      const user = req.user!;

      const result = await WorkoutPlanService.deleteExercise(id, exerciseId, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  /**
   * Add or Update diet plan
   */
  static addOrUpdateDietPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const dietPlan = await WorkoutPlanService.addOrUpdateDietPlan(id, req.body, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Diet plan saved successfully',
        data: dietPlan,
      });
    }
  );

  /**
   * Get diet plan
   */
  static getDietPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const dietPlan = await WorkoutPlanService.getDietPlan(id, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Diet plan retrieved successfully',
        data: dietPlan,
      });
    }
  );

  /**
   * Toggle workout plan status
   */
  static toggleWorkoutPlanStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = req.user!;

      const workoutPlan = await WorkoutPlanService.toggleWorkoutPlanStatus(id, user);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Workout plan ${workoutPlan.isActive ? 'activated' : 'deactivated'} successfully`,
        data: workoutPlan,
      });
    }
  );
}