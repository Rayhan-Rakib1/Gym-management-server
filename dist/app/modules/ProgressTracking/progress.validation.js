"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBMISchema = exports.compareMetricsSchema = exports.memberIdParamSchema = exports.metricIdParamSchema = exports.photoIdParamSchema = exports.getMemberPhotosQuerySchema = exports.uploadProgressPhotoSchema = exports.getMemberMetricsQuerySchema = exports.updateBodyMetricSchema = exports.createBodyMetricSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createBodyMetricSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z
            .string({ message: 'Member ID is required' })
            .uuid('Invalid member ID format'),
        recordDate: zod_1.z
            .string()
            .datetime('Invalid date format')
            .optional()
            .or(zod_1.z.date().optional()),
        weight: zod_1.z
            .number({ message: 'Weight is required' })
            .positive('Weight must be positive')
            .min(20, 'Weight must be at least 20 kg')
            .max(300, 'Weight must not exceed 300 kg')
            .optional(),
        bmi: zod_1.z
            .number()
            .positive('BMI must be positive')
            .min(10, 'BMI must be at least 10')
            .max(60, 'BMI must not exceed 60')
            .optional(),
        bodyFat: zod_1.z
            .number()
            .min(0, 'Body fat cannot be negative')
            .max(70, 'Body fat percentage must not exceed 70')
            .optional(),
        muscleMass: zod_1.z
            .number()
            .positive('Muscle mass must be positive')
            .max(100, 'Muscle mass must not exceed 100 kg')
            .optional(),
        // Measurements in cm
        chest: zod_1.z
            .number()
            .positive('Chest measurement must be positive')
            .max(200, 'Chest measurement must not exceed 200 cm')
            .optional(),
        waist: zod_1.z
            .number()
            .positive('Waist measurement must be positive')
            .max(200, 'Waist measurement must not exceed 200 cm')
            .optional(),
        hips: zod_1.z
            .number()
            .positive('Hips measurement must be positive')
            .max(200, 'Hips measurement must not exceed 200 cm')
            .optional(),
        biceps: zod_1.z
            .number()
            .positive('Biceps measurement must be positive')
            .max(100, 'Biceps measurement must not exceed 100 cm')
            .optional(),
        thighs: zod_1.z
            .number()
            .positive('Thighs measurement must be positive')
            .max(150, 'Thighs measurement must not exceed 150 cm')
            .optional(),
        notes: zod_1.z
            .string()
            .max(500, 'Notes must not exceed 500 characters')
            .optional(),
    }).refine((data) => {
        // At least one metric should be provided
        return (data.weight ||
            data.bmi ||
            data.bodyFat ||
            data.muscleMass ||
            data.chest ||
            data.waist ||
            data.hips ||
            data.biceps ||
            data.thighs);
    }, {
        message: 'At least one body metric is required',
    }),
});
exports.updateBodyMetricSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid metric ID format'),
    }),
    body: zod_1.z.object({
        recordDate: zod_1.z
            .string()
            .datetime('Invalid date format')
            .optional()
            .or(zod_1.z.date().optional()),
        weight: zod_1.z
            .number()
            .positive('Weight must be positive')
            .min(20, 'Weight must be at least 20 kg')
            .max(300, 'Weight must not exceed 300 kg')
            .optional(),
        bmi: zod_1.z
            .number()
            .positive('BMI must be positive')
            .min(10, 'BMI must be at least 10')
            .max(60, 'BMI must not exceed 60')
            .optional(),
        bodyFat: zod_1.z
            .number()
            .min(0, 'Body fat cannot be negative')
            .max(70, 'Body fat percentage must not exceed 70')
            .optional(),
        muscleMass: zod_1.z
            .number()
            .positive('Muscle mass must be positive')
            .max(100, 'Muscle mass must not exceed 100 kg')
            .optional(),
        chest: zod_1.z
            .number()
            .positive('Chest measurement must be positive')
            .max(200, 'Chest measurement must not exceed 200 cm')
            .optional(),
        waist: zod_1.z
            .number()
            .positive('Waist measurement must be positive')
            .max(200, 'Waist measurement must not exceed 200 cm')
            .optional(),
        hips: zod_1.z
            .number()
            .positive('Hips measurement must be positive')
            .max(200, 'Hips measurement must not exceed 200 cm')
            .optional(),
        biceps: zod_1.z
            .number()
            .positive('Biceps measurement must be positive')
            .max(100, 'Biceps measurement must not exceed 100 cm')
            .optional(),
        thighs: zod_1.z
            .number()
            .positive('Thighs measurement must be positive')
            .max(150, 'Thighs measurement must not exceed 150 cm')
            .optional(),
        notes: zod_1.z
            .string()
            .max(500, 'Notes must not exceed 500 characters')
            .optional(),
    }),
});
exports.getMemberMetricsQuerySchema = zod_1.z.object({
    params: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID format'),
    }),
    query: zod_1.z.object({
        startDate: zod_1.z
            .string()
            .datetime('Invalid start date format')
            .optional()
            .or(zod_1.z.date().optional()),
        endDate: zod_1.z
            .string()
            .datetime('Invalid end date format')
            .optional()
            .or(zod_1.z.date().optional()),
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
    }),
});
// ============================================
// PROGRESS PHOTOS VALIDATION SCHEMAS
// ============================================
exports.uploadProgressPhotoSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z
            .string({ message: 'Member ID is required' })
            .uuid('Invalid member ID format'),
        photoDate: zod_1.z
            .string()
            .datetime('Invalid date format')
            .optional()
            .or(zod_1.z.date().optional()),
        imageUrl: zod_1.z
            .string({ message: 'Image URL is required' })
            .url('Invalid image URL'),
        photoType: zod_1.z.nativeEnum(client_1.PhotoType, {
            message: 'Photo type is required',
        }),
        notes: zod_1.z
            .string()
            .max(300, 'Notes must not exceed 300 characters')
            .optional(),
    }),
});
exports.getMemberPhotosQuerySchema = zod_1.z.object({
    params: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID format'),
    }),
    query: zod_1.z.object({
        photoType: zod_1.z.nativeEnum(client_1.PhotoType).optional(),
        startDate: zod_1.z
            .string()
            .datetime('Invalid start date format')
            .optional()
            .or(zod_1.z.date().optional()),
        endDate: zod_1.z
            .string()
            .datetime('Invalid end date format')
            .optional()
            .or(zod_1.z.date().optional()),
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
    }),
});
exports.photoIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid photo ID format'),
    }),
});
exports.metricIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid metric ID format'),
    }),
});
exports.memberIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID format'),
    }),
});
// ============================================
// COMPARISON & ANALYSIS SCHEMAS
// ============================================
exports.compareMetricsSchema = zod_1.z.object({
    params: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID format'),
    }),
    query: zod_1.z.object({
        startDate: zod_1.z
            .string({ message: 'Start date is required' })
            .datetime('Invalid start date format')
            .or(zod_1.z.date()),
        endDate: zod_1.z
            .string({ message: 'End date is required' })
            .datetime('Invalid end date format')
            .or(zod_1.z.date()),
    }),
});
exports.calculateBMISchema = zod_1.z.object({
    body: zod_1.z.object({
        weight: zod_1.z
            .number({ message: 'Weight is required' })
            .positive('Weight must be positive'),
        height: zod_1.z
            .number({ message: 'Height is required' })
            .positive('Height must be positive'),
    }),
});
