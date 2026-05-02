"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlansQuerySchema = exports.togglePlanStatusSchema = exports.updatePlanSchema = exports.createPlanSchema = void 0;
const zod_1 = require("zod");
exports.createPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Plan name must be at least 2 characters'),
        description: zod_1.z.string().optional(),
        durationDays: zod_1.z
            .number()
            .positive('Duration must be positive')
            .int('Duration must be an integer'),
        price: zod_1.z.number().positive('Price must be positive'),
        features: zod_1.z.array(zod_1.z.string()).min(1, 'At least one feature is required'),
        personalTrainingSessions: zod_1.z
            .number()
            .int()
            .min(0, 'Sessions must be non-negative')
            .optional()
            .default(0),
        discount: zod_1.z
            .number()
            .min(0, 'Discount cannot be negative')
            .max(100, 'Discount cannot exceed 100%')
            .optional()
            .default(0),
        isPopular: zod_1.z.boolean().optional().default(false),
    }),
});
exports.updatePlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        durationDays: zod_1.z.number().positive().int().optional(),
        price: zod_1.z.number().positive().optional(),
        features: zod_1.z.array(zod_1.z.string()).optional(),
        personalTrainingSessions: zod_1.z.number().int().min(0).optional(),
        discount: zod_1.z.number().min(0).max(100).optional(),
        isPopular: zod_1.z.boolean().optional(),
    }),
});
exports.togglePlanStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        isActive: zod_1.z.boolean({
            message: "isActive field is required"
        }),
    }),
});
exports.getPlansQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        isActive: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        isPopular: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        minPrice: zod_1.z.string().transform((val) => parseFloat(val)).optional(),
        maxPrice: zod_1.z.string().transform((val) => parseFloat(val)).optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
