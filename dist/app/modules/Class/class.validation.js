"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleSchema = exports.createScheduleSchema = exports.getClassesQuerySchema = exports.updateClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createClassSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({ message: 'Class name is required' })
            .min(3, 'Class name must be at least 3 characters')
            .max(100, 'Class name must not exceed 100 characters'),
        description: zod_1.z
            .string()
            .max(500, 'Description must not exceed 500 characters')
            .optional(),
        trainerId: zod_1.z
            .string({ message: 'Trainer ID is required' })
            .uuid('Invalid trainer ID format'),
        classType: zod_1.z.nativeEnum(client_1.ClassType, {
            message: 'Class type is required',
        }),
        capacity: zod_1.z
            .number({ message: 'Capacity is required' })
            .int('Capacity must be an integer')
            .min(1, 'Capacity must be at least 1')
            .max(100, 'Capacity cannot exceed 100'),
        duration: zod_1.z
            .number({ message: 'Duration is required' })
            .int('Duration must be an integer')
            .min(15, 'Duration must be at least 15 minutes')
            .max(180, 'Duration cannot exceed 180 minutes'),
        imageUrl: zod_1.z
            .string()
            .url('Invalid image URL')
            .optional(),
        isActive: zod_1.z.boolean().optional().default(true),
    }),
});
exports.updateClassSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid class ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(3, 'Class name must be at least 3 characters')
            .max(100, 'Class name must not exceed 100 characters')
            .optional(),
        description: zod_1.z
            .string()
            .max(500, 'Description must not exceed 500 characters')
            .optional(),
        trainerId: zod_1.z
            .string()
            .uuid('Invalid trainer ID format')
            .optional(),
        classType: zod_1.z
            .nativeEnum(client_1.ClassType, { message: 'Invalid class type' })
            .optional(),
        capacity: zod_1.z
            .number()
            .int('Capacity must be an integer')
            .min(1, 'Capacity must be at least 1')
            .max(100, 'Capacity cannot exceed 100')
            .optional(),
        duration: zod_1.z
            .number()
            .int('Duration must be an integer')
            .min(15, 'Duration must be at least 15 minutes')
            .max(180, 'Duration cannot exceed 180 minutes')
            .optional(),
        imageUrl: zod_1.z
            .string()
            .url('Invalid image URL')
            .optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.getClassesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        classType: zod_1.z.nativeEnum(client_1.ClassType).optional(),
        trainerId: zod_1.z.string().uuid('Invalid trainer ID format').optional(),
        search: zod_1.z.string().optional(),
        isActive: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
// SCHEDULE VALIDATION SCHEMAS
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
exports.createScheduleSchema = zod_1.z.object({
    params: zod_1.z.object({
        classId: zod_1.z.string().uuid('Invalid class ID format'),
    }),
    body: zod_1.z
        .object({
        dayOfWeek: zod_1.z.nativeEnum(client_1.DayOfWeek, {
            message: 'Day of week is required',
        }),
        startTime: zod_1.z
            .string({ message: 'Start time is required' })
            .regex(timeRegex, 'Start time must be in HH:MM format'),
        endTime: zod_1.z
            .string({ message: 'End time is required' })
            .regex(timeRegex, 'End time must be in HH:MM format'),
        isRecurring: zod_1.z.boolean().optional().default(true),
        specificDate: zod_1.z
            .string()
            .datetime()
            .optional()
            .or(zod_1.z.date().optional()),
    })
        .refine((data) => {
        if (data.startTime && data.endTime) {
            return data.endTime > data.startTime;
        }
        return true;
    }, {
        message: 'End time must be after start time',
        path: ['endTime'],
    })
        .refine((data) => {
        if (data.isRecurring && data.specificDate) {
            return false;
        }
        return true;
    }, {
        message: 'Specific date cannot be set for recurring schedules',
        path: ['specificDate'],
    }),
});
exports.updateScheduleSchema = zod_1.z.object({
    params: zod_1.z.object({
        classId: zod_1.z.string().uuid('Invalid class ID format'),
        scheduleId: zod_1.z.string().uuid('Invalid schedule ID format'),
    }),
    body: zod_1.z
        .object({
        dayOfWeek: zod_1.z
            .nativeEnum(client_1.DayOfWeek, { message: 'Invalid day of week' })
            .optional(),
        startTime: zod_1.z
            .string()
            .regex(timeRegex, 'Start time must be in HH:MM format')
            .optional(),
        endTime: zod_1.z
            .string()
            .regex(timeRegex, 'End time must be in HH:MM format')
            .optional(),
        isRecurring: zod_1.z.boolean().optional(),
        specificDate: zod_1.z
            .string()
            .datetime()
            .optional()
            .or(zod_1.z.date().optional()),
    })
        .refine((data) => {
        if (data.startTime && data.endTime) {
            return data.endTime > data.startTime;
        }
        return true;
    }, {
        message: 'End time must be after start time',
        path: ['endTime'],
    }),
});
