import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/ApiError';
import httpStatus from 'http-status';
import prisma from '../../shared/prisma';
import config from '../../config';

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.accessToken;

    // If not in cookies, try Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new AppError('Authentication required', httpStatus.UNAUTHORIZED);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.access_secret!) as JwtPayload;

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', httpStatus.FORBIDDEN);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', httpStatus.UNAUTHORIZED));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', httpStatus.UNAUTHORIZED));
    }
    next(error);
  }
};
