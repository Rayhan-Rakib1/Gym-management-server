import { Role } from '@prisma/client';
import z from 'zod';

export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z
      .string()
      .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number')
      .optional(),
    profileImage: z.string().url('Invalid image URL').optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum([Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.MEMBER]),
  }),
});

export const toggleUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const uploadAvatarSchema = z.object({
  file: z.object({
    mimetype: z
      .string()
      .refine((val) => val.startsWith('image/'), 'File must be an image'),
    size: z
      .number()
      .max(5 * 1024 * 1024, 'Image size must be less than 5MB'),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    role: z
      .enum([Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.MEMBER])
      .optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});


export const userValidation = {
  updateUserProfileSchema,
  updateUserRoleSchema,
  toggleUserStatusSchema,
  uploadAvatarSchema,
  getUsersQuerySchema,
};