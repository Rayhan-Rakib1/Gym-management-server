import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/ApiError';
import httpStatus from 'http-status';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', httpStatus.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        httpStatus.FORBIDDEN
      );
    }

    next();
  };
};