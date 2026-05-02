import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/ApiError';
import { UserService } from './user.service';
import { sendResponse } from '../../../utils/sendResponse';
import catchAsync from '../../../utils/catchAsync';
import httpStatus from 'http-status';
import { fileUploader } from '../../../helpers/fileUploader';

export class UserController {

  static getAllUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await UserService.getAllUsers(req.query as any);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: {
          page: 1,
          limit: 10,
          total: result.users.length,
        },
      });
    }
  );

  static getUserById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    }
  );


  static updateUserProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const user = await UserService.updateUserProfile(
        id,
        req.body,
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User profile updated successfully',
        data: user,
      });
    }
  );


  static deleteUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );


  static toggleUserStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const user = await UserService.toggleUserStatus(
        id,
        req.body,
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User status updated successfully',
        data: user,
      });
    }
  );

  static updateUserRole = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const user = await UserService.updateUserRole(
        id,
        req.body,
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    }
  );


  static getUserStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await UserService.getUserStats();

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats,
      });
    }
  );


  static uploadAvatar = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const file = req.file;
      if (!file) throw new AppError("No image uploaded", httpStatus.BAD_REQUEST);

      const result = await fileUploader.uploadToCloudinary(file);

      await UserService.uploadAvatar(id, result.url);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Avatar uploaded successfully',
        data: result,
      });
    }
  );
}