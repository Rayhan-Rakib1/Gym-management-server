import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Plan name must be at least 2 characters'),
    description: z.string().optional(),
    durationDays: z
      .number()
      .positive('Duration must be positive')
      .int('Duration must be an integer'),
    price: z.number().positive('Price must be positive'),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    personalTrainingSessions: z
      .number()
      .int()
      .min(0, 'Sessions must be non-negative')
      .optional()
      .default(0),
    discount: z
      .number()
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%')
      .optional()
      .default(0),
    isPopular: z.boolean().optional().default(false),
  }),
});

export const updatePlanSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    durationDays: z.number().positive().int().optional(),
    price: z.number().positive().optional(),
    features: z.array(z.string()).optional(),
    personalTrainingSessions: z.number().int().min(0).optional(),
    discount: z.number().min(0).max(100).optional(),
    isPopular: z.boolean().optional(),
  }),
});

export const togglePlanStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean( {
        message: "isActive field is required"
    }),
  }),
});

export const getPlansQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    isPopular: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    minPrice: z.string().transform((val) => parseFloat(val)).optional(),
    maxPrice: z.string().transform((val) => parseFloat(val)).optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

