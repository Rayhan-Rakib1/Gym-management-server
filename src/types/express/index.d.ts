import 'express';
import { Role } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
    user?: {
      id: string;
      role: Role;
      email: string;
    };
  }
}
