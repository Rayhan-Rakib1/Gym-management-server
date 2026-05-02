"use strict";
// src/modules/review/review.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.markHelpfulSchema = exports.reportReviewSchema = exports.getTrainerRatingSummarySchema = exports.getAllReviewsQuerySchema = exports.verifyReviewSchema = exports.getMemberReviewsSchema = exports.deleteReviewSchema = exports.getReviewByIdSchema = exports.getTrainerReviewsSchema = exports.updateReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
/**
 * Create trainer review validation
 */
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        trainerId: zod_1.z.string().min(1, 'Trainer ID is required'),
        rating: zod_1.z
            .number()
            .int('Rating must be an integer')
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5'),
        comment: zod_1.z
            .string()
            .min(10, 'Comment must be at least 10 characters')
            .max(1000, 'Comment cannot exceed 1000 characters')
            .optional()
            .nullable(),
        tags: zod_1.z
            .array(zod_1.z.string())
            .max(10, 'Cannot add more than 10 tags')
            .optional()
            .default([]),
    }),
});
/**
 * Update review validation
 */
exports.updateReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Review ID is required'),
    }),
    body: zod_1.z.object({
        rating: zod_1.z
            .number()
            .int('Rating must be an integer')
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5')
            .optional(),
        comment: zod_1.z
            .string()
            .min(10, 'Comment must be at least 10 characters')
            .max(1000, 'Comment cannot exceed 1000 characters')
            .optional()
            .nullable(),
        tags: zod_1.z
            .array(zod_1.z.string())
            .max(10, 'Cannot add more than 10 tags')
            .optional(),
    }),
});
/**
 * Get trainer reviews validation
 */
exports.getTrainerReviewsSchema = zod_1.z.object({
    params: zod_1.z.object({
        trainerId: zod_1.z.string().min(1, 'Trainer ID is required'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        rating: zod_1.z
            .string()
            .transform((val) => (val ? parseInt(val) : undefined))
            .optional(),
        isVerified: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        sortBy: zod_1.z
            .enum(['createdAt', 'rating', 'helpful'])
            .optional()
            .default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
/**
 * Get review by ID validation
 */
exports.getReviewByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Review ID is required'),
    }),
});
/**
 * Delete review validation
 */
exports.deleteReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Review ID is required'),
    }),
});
/**
 * Get member reviews validation
 */
exports.getMemberReviewsSchema = zod_1.z.object({
    params: zod_1.z.object({
        memberId: zod_1.z.string().min(1, 'Member ID is required'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
    }),
});
/**
 * Verify review validation (Admin only)
 */
exports.verifyReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Review ID is required'),
    }),
    body: zod_1.z.object({
        isVerified: zod_1.z.boolean({
            message: 'isVerified field is required',
        }),
    }),
});
/**
 * Get all reviews query validation (Admin)
 */
exports.getAllReviewsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        trainerId: zod_1.z.string().optional(),
        memberId: zod_1.z.string().optional(),
        rating: zod_1.z
            .string()
            .transform((val) => (val ? parseInt(val) : undefined))
            .optional(),
        isVerified: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z
            .enum(['createdAt', 'rating'])
            .optional()
            .default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
/**
 * Get trainer rating summary validation
 */
exports.getTrainerRatingSummarySchema = zod_1.z.object({
    params: zod_1.z.object({
        trainerId: zod_1.z.string().min(1, 'Trainer ID is required'),
    }),
});
/**
 * Report review validation
 */
exports.reportReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Review ID is required'),
    }),
    body: zod_1.z.object({
        reason: zod_1.z
            .string()
            .min(10, 'Reason must be at least 10 characters')
            .max(500, 'Reason cannot exceed 500 characters'),
    }),
});
/**
 * Mark review helpful validation
 */
exports.markHelpfulSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Review ID is required'),
    }),
});
