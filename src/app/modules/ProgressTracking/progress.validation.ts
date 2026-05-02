
import { z } from 'zod';
import { PhotoType } from '@prisma/client';

export const createBodyMetricSchema = z.object({
    body: z.object({
        memberId: z
            .string({ message: 'Member ID is required' })
            .uuid('Invalid member ID format'),

        recordDate: z
            .string()
            .datetime('Invalid date format')
            .optional()
            .or(z.date().optional()),

        weight: z
            .number({ message: 'Weight is required' })
            .positive('Weight must be positive')
            .min(20, 'Weight must be at least 20 kg')
            .max(300, 'Weight must not exceed 300 kg')
            .optional(),

        bmi: z
            .number()
            .positive('BMI must be positive')
            .min(10, 'BMI must be at least 10')
            .max(60, 'BMI must not exceed 60')
            .optional(),

        bodyFat: z
            .number()
            .min(0, 'Body fat cannot be negative')
            .max(70, 'Body fat percentage must not exceed 70')
            .optional(),

        muscleMass: z
            .number()
            .positive('Muscle mass must be positive')
            .max(100, 'Muscle mass must not exceed 100 kg')
            .optional(),

        // Measurements in cm
        chest: z
            .number()
            .positive('Chest measurement must be positive')
            .max(200, 'Chest measurement must not exceed 200 cm')
            .optional(),

        waist: z
            .number()
            .positive('Waist measurement must be positive')
            .max(200, 'Waist measurement must not exceed 200 cm')
            .optional(),

        hips: z
            .number()
            .positive('Hips measurement must be positive')
            .max(200, 'Hips measurement must not exceed 200 cm')
            .optional(),

        biceps: z
            .number()
            .positive('Biceps measurement must be positive')
            .max(100, 'Biceps measurement must not exceed 100 cm')
            .optional(),

        thighs: z
            .number()
            .positive('Thighs measurement must be positive')
            .max(150, 'Thighs measurement must not exceed 150 cm')
            .optional(),

        notes: z
            .string()
            .max(500, 'Notes must not exceed 500 characters')
            .optional(),
    }).refine(
        (data) => {
            // At least one metric should be provided
            return (
                data.weight ||
                data.bmi ||
                data.bodyFat ||
                data.muscleMass ||
                data.chest ||
                data.waist ||
                data.hips ||
                data.biceps ||
                data.thighs
            );
        },
        {
            message: 'At least one body metric is required',
        }
    ),
});

export const updateBodyMetricSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid metric ID format'),
    }),
    body: z.object({
        recordDate: z
            .string()
            .datetime('Invalid date format')
            .optional()
            .or(z.date().optional()),

        weight: z
            .number()
            .positive('Weight must be positive')
            .min(20, 'Weight must be at least 20 kg')
            .max(300, 'Weight must not exceed 300 kg')
            .optional(),

        bmi: z
            .number()
            .positive('BMI must be positive')
            .min(10, 'BMI must be at least 10')
            .max(60, 'BMI must not exceed 60')
            .optional(),

        bodyFat: z
            .number()
            .min(0, 'Body fat cannot be negative')
            .max(70, 'Body fat percentage must not exceed 70')
            .optional(),

        muscleMass: z
            .number()
            .positive('Muscle mass must be positive')
            .max(100, 'Muscle mass must not exceed 100 kg')
            .optional(),

        chest: z
            .number()
            .positive('Chest measurement must be positive')
            .max(200, 'Chest measurement must not exceed 200 cm')
            .optional(),

        waist: z
            .number()
            .positive('Waist measurement must be positive')
            .max(200, 'Waist measurement must not exceed 200 cm')
            .optional(),

        hips: z
            .number()
            .positive('Hips measurement must be positive')
            .max(200, 'Hips measurement must not exceed 200 cm')
            .optional(),

        biceps: z
            .number()
            .positive('Biceps measurement must be positive')
            .max(100, 'Biceps measurement must not exceed 100 cm')
            .optional(),

        thighs: z
            .number()
            .positive('Thighs measurement must be positive')
            .max(150, 'Thighs measurement must not exceed 150 cm')
            .optional(),

        notes: z
            .string()
            .max(500, 'Notes must not exceed 500 characters')
            .optional(),
    }),
});

export const getMemberMetricsQuerySchema = z.object({
    params: z.object({
        memberId: z.string().uuid('Invalid member ID format'),
    }),
    query: z.object({
        startDate: z
            .string()
            .datetime('Invalid start date format')
            .optional()
            .or(z.date().optional()),
        endDate: z
            .string()
            .datetime('Invalid end date format')
            .optional()
            .or(z.date().optional()),
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
    }),
});

// ============================================
// PROGRESS PHOTOS VALIDATION SCHEMAS
// ============================================

export const uploadProgressPhotoSchema = z.object({
    body: z.object({
        memberId: z
            .string({ message: 'Member ID is required' })
            .uuid('Invalid member ID format'),

        photoDate: z
            .string()
            .datetime('Invalid date format')
            .optional()
            .or(z.date().optional()),

        imageUrl: z
            .string({ message: 'Image URL is required' })
            .url('Invalid image URL'),

        photoType: z.nativeEnum(PhotoType, {
            message: 'Photo type is required',
        }),

        notes: z
            .string()
            .max(300, 'Notes must not exceed 300 characters')
            .optional(),
    }),
});

export const getMemberPhotosQuerySchema = z.object({
    params: z.object({
        memberId: z.string().uuid('Invalid member ID format'),
    }),
    query: z.object({
        photoType: z.nativeEnum(PhotoType).optional(),
        startDate: z
            .string()
            .datetime('Invalid start date format')
            .optional()
            .or(z.date().optional()),
        endDate: z
            .string()
            .datetime('Invalid end date format')
            .optional()
            .or(z.date().optional()),
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
    }),
});

export const photoIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid photo ID format'),
    }),
});

export const metricIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid metric ID format'),
    }),
});

export const memberIdParamSchema = z.object({
    params: z.object({
        memberId: z.string().uuid('Invalid member ID format'),
    }),
});

// ============================================
// COMPARISON & ANALYSIS SCHEMAS
// ============================================

export const compareMetricsSchema = z.object({
    params: z.object({
        memberId: z.string().uuid('Invalid member ID format'),
    }),
    query: z.object({
        startDate: z
            .string({ message: 'Start date is required' })
            .datetime('Invalid start date format')
            .or(z.date()),
        endDate: z
            .string({ message: 'End date is required' })
            .datetime('Invalid end date format')
            .or(z.date()),
    }),
});

export const calculateBMISchema = z.object({
    body: z.object({
        weight: z
            .number({ message: 'Weight is required' })
            .positive('Weight must be positive'),
        height: z
            .number({ message: 'Height is required' })
            .positive('Height must be positive'),
    }),
});