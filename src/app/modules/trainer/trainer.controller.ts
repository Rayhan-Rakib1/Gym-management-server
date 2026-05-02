import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TrainerService } from './trainer.service';
import { sendResponse } from '../../../utils/sendResponse';
import httpStatus from 'http-status';

export class TrainerController {

  static getAllTrainers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await TrainerService.getAllTrainers(req.query as any);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainers retrieved successfully',
        data: result.trainers,
        meta: result.pagination,
      });
    }
  );


  static searchTrainers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const filters = {
        specializations: req.query.specializations
          ? (req.query.specializations as string).split(',')
          : undefined,
        minRating: req.query.minRating
          ? parseFloat(req.query.minRating as string)
          : undefined,
        isAvailable: req.query.isAvailable
          ? req.query.isAvailable === 'true'
          : undefined,
        dayOfWeek: req.query.dayOfWeek as string | undefined,
        timeSlot: req.query.timeSlot as string | undefined,
      };

      const trainers = await TrainerService.searchTrainers(filters);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainers found successfully',
        data: trainers,
      });
    }
  );


  static getTrainerStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await TrainerService.getTrainerStats();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer statistics retrieved successfully',
        data: stats,
      });
    }
  );


  static getTrainerById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const trainer = await TrainerService.getTrainerById(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer retrieved successfully',
        data: trainer,
      });
    }
  );


  static createTrainer = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const createdBy = req.user?.id!;
      const trainer = await TrainerService.createTrainer(req.body, createdBy);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Trainer created successfully',
        data: trainer,
      });
    }
  );


  static updateTrainer = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updatedBy = req.user?.id!;
      const trainer = await TrainerService.updateTrainer(id, req.body, updatedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer updated successfully',
        data: trainer,
      });
    }
  );


  static deleteTrainer = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const deletedBy = req.user?.id!;
      const result = await TrainerService.deleteTrainer(id, deletedBy);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  static getTrainerDashboard = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const dashboard = await TrainerService.getTrainerDashboard(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboard,
      });
    }
  );


  static getTrainerMembers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await TrainerService.getTrainerMembers(id, page, limit);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer members retrieved successfully',
        data: result.members,
        meta: result.pagination,
      });
    }
  );

  static getTrainerReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await TrainerService.getTrainerReviews(id, page, limit);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
      });
    }
  );


  static getTrainerPerformance = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const performance = await TrainerService.getTrainerPerformance(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trainer performance retrieved successfully',
        data: performance,
      });
    }
  );


  static addSpecialization = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const specialization = await TrainerService.addSpecialization(id, req.body);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Specialization added successfully',
        data: specialization,
      });
    }
  );


  static updateSpecialization = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { specId } = req.params;
      const specialization = await TrainerService.updateSpecialization(
        specId,
        req.body
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialization updated successfully',
        data: specialization,
      });
    }
  );


  static deleteSpecialization = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { specId } = req.params;
      const result = await TrainerService.deleteSpecialization(specId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  static setAvailability = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const availability = await TrainerService.setAvailability(id, req.body);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Availability set successfully',
        data: availability,
      });
    }
  );


  static updateAvailability = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { availId } = req.params;
      const availability = await TrainerService.updateAvailability(
        availId,
        req.body
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Availability updated successfully',
        data: availability,
      });
    }
  );

  static deleteAvailability = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { availId } = req.params;
      const result = await TrainerService.deleteAvailability(availId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );
}