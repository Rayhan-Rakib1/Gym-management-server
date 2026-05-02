// src/modules/review/review.validation.ts

import { z } from 'zod';

/**
 * Create trainer review validation
 */
export const createReviewSchema = z.object({
    body: z.object({
        trainerId: z.string().min(1, 'Trainer ID is required'),
        rating: z
            .number()
            .int('Rating must be an integer')
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5'),
        comment: z
            .string()
            .min(10, 'Comment must be at least 10 characters')
            .max(1000, 'Comment cannot exceed 1000 characters')
            .optional()
            .nullable(),
        tags: z
            .array(z.string())
            .max(10, 'Cannot add more than 10 tags')
            .optional()
            .default([]),
    }),
});

/**
 * Update review validation
 */
export const updateReviewSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
    body: z.object({
        rating: z
            .number()
            .int('Rating must be an integer')
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5')
            .optional(),
        comment: z
            .string()
            .min(10, 'Comment must be at least 10 characters')
            .max(1000, 'Comment cannot exceed 1000 characters')
            .optional()
            .nullable(),
        tags: z
            .array(z.string())
            .max(10, 'Cannot add more than 10 tags')
            .optional(),
    }),
});

/**
 * Get trainer reviews validation
 */
export const getTrainerReviewsSchema = z.object({
    params: z.object({
        trainerId: z.string().min(1, 'Trainer ID is required'),
    }),
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        rating: z
            .string()
            .transform((val) => (val ? parseInt(val) : undefined))
            .optional(),
        isVerified: z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        sortBy: z
            .enum(['createdAt', 'rating', 'helpful'])
            .optional()
            .default('createdAt'),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});

/**
 * Get review by ID validation
 */
export const getReviewByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
});

/**
 * Delete review validation
 */
export const deleteReviewSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
});

/**
 * Get member reviews validation
 */
export const getMemberReviewsSchema = z.object({
    params: z.object({
        memberId: z.string().min(1, 'Member ID is required'),
    }),
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
    }),
});

/**
 * Verify review validation (Admin only)
 */
export const verifyReviewSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
    body: z.object({
        isVerified: z.boolean({
            message: 'isVerified field is required',
        }),
    }),
});

/**
 * Get all reviews query validation (Admin)
 */
export const getAllReviewsQuerySchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        trainerId: z.string().optional(),
        memberId: z.string().optional(),
        rating: z
            .string()
            .transform((val) => (val ? parseInt(val) : undefined))
            .optional(),
        isVerified: z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        search: z.string().optional(),
        sortBy: z
            .enum(['createdAt', 'rating'])
            .optional()
            .default('createdAt'),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});

/**
 * Get trainer rating summary validation
 */
export const getTrainerRatingSummarySchema = z.object({
    params: z.object({
        trainerId: z.string().min(1, 'Trainer ID is required'),
    }),
});

/**
 * Report review validation
 */
export const reportReviewSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
    body: z.object({
        reason: z
            .string()
            .min(10, 'Reason must be at least 10 characters')
            .max(500, 'Reason cannot exceed 500 characters'),
    }),
});

/**
 * Mark review helpful validation
 */
export const markHelpfulSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
});