import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { AuthService } from './auth.service';
import { sendResponse } from '../../../utils/sendResponse';
import { AppError } from '../../errors/ApiError';
import config from '../../../config';
import httpStatus from 'http-status';

export class AuthController {

  static register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('Request Body:', req.body); // Debugging line
      const result = await AuthService.register(req.body);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: result.message,
        data: { userId: result.userId },
      });
    }
  );

  static login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await AuthService.login(req.body);
      const { accessToken, refreshToken } = result;

      // Set access token in httpOnly cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.node_env === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.node_env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: accessToken,
        },
      });
    }
  );

  
  static getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      const user = await AuthService.getMe(userId!);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User profile retrieved successfully',
        data: user,
      });
    }
  );

  static logout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Logout successful',
        data: null,
      });
    }
  );

  static refreshToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError('Refresh token not provided', httpStatus.UNAUTHORIZED);
      }

      const result = await AuthService.refreshToken({ refreshToken });

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
        },
      });
    }
  );

  static forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await AuthService.forgotPassword(req.body);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );


  static resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token } = req.params;
      const result = await AuthService.resetPassword(token, req.body);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

  static verifyEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token } = req.params;
      const result = await AuthService.verifyEmail(token);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );


  static resendVerification = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      const result = await AuthService.resendVerification(userId!);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );


  static changePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      const result = await AuthService.changePassword(userId!, req.body);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
      });
    }
  );

}