
import { z } from 'zod';
import { ClassType, DayOfWeek } from '@prisma/client';


export const createClassSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Class name is required' })
      .min(3, 'Class name must be at least 3 characters')
      .max(100, 'Class name must not exceed 100 characters'),

    description: z
      .string()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),

    trainerId: z
      .string({ message: 'Trainer ID is required' })
      .uuid('Invalid trainer ID format'),

    classType: z.nativeEnum(ClassType, {
      message: 'Class type is required',
    }),

    capacity: z
      .number({ message: 'Capacity is required' })
      .int('Capacity must be an integer')
      .min(1, 'Capacity must be at least 1')
      .max(100, 'Capacity cannot exceed 100'),

    duration: z
      .number({ message: 'Duration is required' })
      .int('Duration must be an integer')
      .min(15, 'Duration must be at least 15 minutes')
      .max(180, 'Duration cannot exceed 180 minutes'),

    imageUrl: z
      .string()
      .url('Invalid image URL')
      .optional(),

    isActive: z.boolean().optional().default(true),
  }),
});

export const updateClassSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid class ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Class name must be at least 3 characters')
      .max(100, 'Class name must not exceed 100 characters')
      .optional(),

    description: z
      .string()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),

    trainerId: z
      .string()
      .uuid('Invalid trainer ID format')
      .optional(),

    classType: z
      .nativeEnum(ClassType, { message: 'Invalid class type' })
      .optional(),

    capacity: z
      .number()
      .int('Capacity must be an integer')
      .min(1, 'Capacity must be at least 1')
      .max(100, 'Capacity cannot exceed 100')
      .optional(),

    duration: z
      .number()
      .int('Duration must be an integer')
      .min(15, 'Duration must be at least 15 minutes')
      .max(180, 'Duration cannot exceed 180 minutes')
      .optional(),

    imageUrl: z
      .string()
      .url('Invalid image URL')
      .optional(),

    isActive: z.boolean().optional(),
  }),
});

export const getClassesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    classType: z.nativeEnum(ClassType).optional(),
    trainerId: z.string().uuid('Invalid trainer ID format').optional(),
    search: z.string().optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// SCHEDULE VALIDATION SCHEMAS
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createScheduleSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Invalid class ID format'),
  }),
  body: z
    .object({
      dayOfWeek: z.nativeEnum(DayOfWeek, {
        message: 'Day of week is required',
      }),

      startTime: z
        .string({ message: 'Start time is required' })
        .regex(timeRegex, 'Start time must be in HH:MM format'),

      endTime: z
        .string({ message: 'End time is required' })
        .regex(timeRegex, 'End time must be in HH:MM format'),

      isRecurring: z.boolean().optional().default(true),

      specificDate: z
        .string()
        .datetime()
        .optional()
        .or(z.date().optional()),
    })
    .refine(
      (data) => {
        if (data.startTime && data.endTime) {
          return data.endTime > data.startTime;
        }
        return true;
      },
      {
        message: 'End time must be after start time',
        path: ['endTime'],
      }
    )
    .refine(
      (data) => {
        if (data.isRecurring && data.specificDate) {
          return false;
        }
        return true;
      },
      {
        message: 'Specific date cannot be set for recurring schedules',
        path: ['specificDate'],
      }
    ),
});

export const updateScheduleSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Invalid class ID format'),
    scheduleId: z.string().uuid('Invalid schedule ID format'),
  }),
  body: z
    .object({
      dayOfWeek: z
        .nativeEnum(DayOfWeek, { message: 'Invalid day of week' })
        .optional(),

      startTime: z
        .string()
        .regex(timeRegex, 'Start time must be in HH:MM format')
        .optional(),

      endTime: z
        .string()
        .regex(timeRegex, 'End time must be in HH:MM format')
        .optional(),

      isRecurring: z.boolean().optional(),

      specificDate: z
        .string()
        .datetime()
        .optional()
        .or(z.date().optional()),
    })
    .refine(
      (data) => {
        if (data.startTime && data.endTime) {
          return data.endTime > data.startTime;
        }
        return true;
      },
      {
        message: 'End time must be after start time',
        path: ['endTime'],
      }
    ),
});
