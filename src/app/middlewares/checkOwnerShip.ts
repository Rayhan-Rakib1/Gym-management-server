import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/ApiError';
import { Role } from '@prisma/client';

export const checkOwnership = (resource?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const currentUser = req.user;

    // Super Admin and Admin can access any resource
    if (
      currentUser?.role === Role.SUPER_ADMIN ||
      currentUser?.role === Role.ADMIN 
    ) {
      return next();
    }

    // Check if user is accessing their own resource
    if (currentUser?.id !== userId) {
      throw new AppError('You are not authorized to access this resource', httpStatus.FORBIDDEN);
    }

    next();
  };
};