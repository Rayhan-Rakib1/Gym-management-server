import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { PlanService } from './membership.service';
import { sendResponse } from '../../../utils/sendResponse';
import { AppError } from '../../errors/ApiError';

export class PlanController {

  static getAllPlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await PlanService.getAllPlans(req.query as any);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Membership plans retrieved successfully',
        data: result.plans,
        meta: result.pagination,
      });
    }
  );

  static getActivePlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const plans = await PlanService.getActivePlans();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Active plans retrieved successfully',
        data: plans,
      });
    }
  );


  static getPopularPlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const plans = await PlanService.getPopularPlans();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Popular plans retrieved successfully',
        data: plans,
      });
    }
  );


  static getPlanStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await PlanService.getPlanStats();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plan statistics retrieved successfully',
        data: stats,
      });
    }
  );


  static comparePlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { planIds } = req.body;

      if (!planIds || !Array.isArray(planIds)) {
        throw new AppError('planIds array is required', httpStatus.BAD_REQUEST);
      }

      const plans = await PlanService.comparePlans(planIds);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plans compared successfully',
        data: plans,
      });
    }
  );


  static getPlanById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const plan = await PlanService.getPlanById(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plan retrieved successfully',
        data: plan,
      });
    }
  );

  static createPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const createdBy = req.user?.id!;
      const plan = await PlanService.createPlan(req.body, createdBy);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Membership plan created successfully',
        data: plan,
      });
    }
  );

  static updatePlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updatedBy = req.user?.id!;
      const plan = await PlanService.updatePlan(id, req.body, updatedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plan updated successfully',
        data: plan,
      });
    }
  );

  static togglePlanStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updatedBy = req.user?.id!;
      const plan = await PlanService.togglePlanStatus(id, req.body, updatedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plan status updated successfully',
        data: plan,
      });
    }
  );


  static deletePlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const deletedBy = req.user?.id!;
      const result = await PlanService.deletePlan(id, deletedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );


  static getPlanMembers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PlanService.getPlanMembers(id, page, limit);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Plan members retrieved successfully',
        data: result.members,
        meta: result.pagination,
      });
    }
  );


  static calculateSavings = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const savings = await PlanService.calculateSavings(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Savings calculated successfully',
        data: savings,
      });
    }
  );
}
