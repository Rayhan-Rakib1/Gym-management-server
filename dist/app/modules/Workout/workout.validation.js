"use strict";
// src/modules/workoutPlan/workoutPlan.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWorkoutPlanStatusSchema = exports.getDietPlanSchema = exports.addOrUpdateDietSchema = exports.deleteExerciseSchema = exports.updateExerciseSchema = exports.addExerciseSchema = exports.getTrainerWorkoutPlansSchema = exports.getMemberWorkoutPlansSchema = exports.deleteWorkoutPlanSchema = exports.updateWorkoutPlanSchema = exports.getWorkoutPlanByIdSchema = exports.getWorkoutPlansQuerySchema = exports.createWorkoutPlanSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
/**
 * Exercise schema for nested validation
 */
const exerciseSchema = zod_1.z.object({
    dayOfWeek: zod_1.z.nativeEnum(client_1.DayOfWeek, {
        message: 'Invalid day of week',
    }),
    exerciseName: zod_1.z
        .string()
        .min(2, 'Exercise name must be at least 2 characters')
        .max(100, 'Exercise name cannot exceed 100 characters'),
    sets: zod_1.z
        .number()
        .int('Sets must be an integer')
        .min(1, 'Sets must be at least 1')
        .max(20, 'Sets cannot exceed 20'),
    reps: zod_1.z
        .number()
        .int('Reps must be an integer')
        .min(1, 'Reps must be at least 1')
        .max(100, 'Reps cannot exceed 100'),
    weight: zod_1.z
        .number()
        .min(0, 'Weight cannot be negative')
        .optional()
        .nullable(),
    restTime: zod_1.z
        .number()
        .int('Rest time must be an integer')
        .min(0, 'Rest time cannot be negative')
        .optional()
        .nullable(),
    videoUrl: zod_1.z
        .string()
        .url('Video URL must be a valid URL')
        .optional()
        .or(zod_1.z.literal(''))
        .nullable(),
    instructions: zod_1.z
        .string()
        .max(500, 'Instructions cannot exceed 500 characters')
        .optional()
        .nullable(),
    orderIndex: zod_1.z
        .number()
        .int()
        .min(0, 'Order index cannot be negative')
        .optional()
        .default(0),
});
/**
 * Create workout plan validation
 */
exports.createWorkoutPlanSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        memberId: zod_1.z.string().min(1, 'Member ID is required'),
        trainerId: zod_1.z.string().optional(), // Optional for trainers (auto-assigned)
        planName: zod_1.z
            .string()
            .min(3, 'Plan name must be at least 3 characters')
            .max(100, 'Plan name cannot exceed 100 characters'),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot exceed 500 characters')
            .optional()
            .nullable(),
        startDate: zod_1.z
            .string()
            .or(zod_1.z.date())
            .transform((val) => new Date(val)),
        endDate: zod_1.z
            .string()
            .or(zod_1.z.date())
            .transform((val) => new Date(val)),
        goals: zod_1.z.array(zod_1.z.string()).optional().default([]),
        notes: zod_1.z
            .string()
            .max(1000, 'Notes cannot exceed 1000 characters')
            .optional()
            .nullable(),
        exercises: zod_1.z.array(exerciseSchema).optional().default([]),
    })
        .refine((data) => data.endDate > data.startDate, {
        message: 'End date must be after start date',
        path: ['endDate'],
    }),
});
/**
 * Get workout plans query validation
 */
exports.getWorkoutPlansQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        isActive: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        trainerId: zod_1.z.string().optional(),
        memberId: zod_1.z.string().optional(),
    }),
});
/**
 * Get workout plan by ID validation
 */
exports.getWorkoutPlanByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
    }),
});
/**
 * Update workout plan validation
 */
exports.updateWorkoutPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
    }),
    body: zod_1.z
        .object({
        planName: zod_1.z
            .string()
            .min(3, 'Plan name must be at least 3 characters')
            .max(100, 'Plan name cannot exceed 100 characters')
            .optional(),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot exceed 500 characters')
            .optional()
            .nullable(),
        startDate: zod_1.z
            .string()
            .or(zod_1.z.date())
            .transform((val) => new Date(val))
            .optional(),
        endDate: zod_1.z
            .string()
            .or(zod_1.z.date())
            .transform((val) => new Date(val))
            .optional(),
        goals: zod_1.z.array(zod_1.z.string()).optional(),
        notes: zod_1.z
            .string()
            .max(1000, 'Notes cannot exceed 1000 characters')
            .optional()
            .nullable(),
        isActive: zod_1.z.boolean().optional(),
    })
        .refine((data) => {
        if (data.startDate && data.endDate) {
            return data.endDate > data.startDate;
        }
        return true;
    }, {
        message: 'End date must be after start date',
        path: ['endDate'],
    }),
});
/**
 * Delete workout plan validation
 */
exports.deleteWorkoutPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
    }),
});
/**
 * Get member workout plans validation
 */
exports.getMemberWorkoutPlansSchema = zod_1.z.object({
    params: zod_1.z.object({
        memberId: zod_1.z.string().min(1, 'Member ID is required'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        isActive: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
    }),
});
/**
 * Get trainer workout plans validation
 */
exports.getTrainerWorkoutPlansSchema = zod_1.z.object({
    params: zod_1.z.object({
        trainerId: zod_1.z.string().min(1, 'Trainer ID is required'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        isActive: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
    }),
});
/**
 * Add exercise validation
 */
exports.addExerciseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
    }),
    body: exerciseSchema,
});
/**
 * Update exercise validation
 */
exports.updateExerciseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
        exerciseId: zod_1.z.string().min(1, 'Exercise ID is required'),
    }),
    body: zod_1.z.object({
        dayOfWeek: zod_1.z.nativeEnum(client_1.DayOfWeek).optional(),
        exerciseName: zod_1.z
            .string()
            .min(2, 'Exercise name must be at least 2 characters')
            .max(100, 'Exercise name cannot exceed 100 characters')
            .optional(),
        sets: zod_1.z
            .number()
            .int()
            .min(1, 'Sets must be at least 1')
            .max(20, 'Sets cannot exceed 20')
            .optional(),
        reps: zod_1.z
            .number()
            .int()
            .min(1, 'Reps must be at least 1')
            .max(100, 'Reps cannot exceed 100')
            .optional(),
        weight: zod_1.z.number().min(0, 'Weight cannot be negative').optional().nullable(),
        restTime: zod_1.z
            .number()
            .int()
            .min(0, 'Rest time cannot be negative')
            .optional()
            .nullable(),
        videoUrl: zod_1.z
            .string()
            .url('Video URL must be a valid URL')
            .optional()
            .or(zod_1.z.literal(''))
            .nullable(),
        instructions: zod_1.z
            .string()
            .max(500, 'Instructions cannot exceed 500 characters')
            .optional()
            .nullable(),
        orderIndex: zod_1.z.number().int().min(0).optional(),
    }),
});
/**
 * Delete exercise validation
 */
exports.deleteExerciseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
        exerciseId: zod_1.z.string().min(1, 'Exercise ID is required'),
    }),
});
/**
 * Add or update diet plan validation
 */
exports.addOrUpdateDietSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
    }),
    body: zod_1.z.object({
        breakfast: zod_1.z
            .string()
            .max(500, 'Breakfast details cannot exceed 500 characters')
            .optional()
            .nullable(),
        midMorning: zod_1.z
            .string()
            .max(500, 'Mid morning details cannot exceed 500 characters')
            .optional()
            .nullable(),
        lunch: zod_1.z
            .string()
            .max(500, 'Lunch details cannot exceed 500 characters')
            .optional()
            .nullable(),
        evening: zod_1.z
            .string()
            .max(500, 'Evening details cannot exceed 500 characters')
            .optional()
            .nullable(),
        dinner: zod_1.z
            .string()
            .max(500, 'Dinner details cannot exceed 500 characters')
            .optional()
            .nullable(),
        totalCalories: zod_1.z
            .number()
            .int()
            .min(0, 'Total calories cannot be negative')
            .optional()
            .nullable(),
        proteinGrams: zod_1.z
            .number()
            .min(0, 'Protein grams cannot be negative')
            .optional()
            .nullable(),
        carbsGrams: zod_1.z
            .number()
            .min(0, 'Carbs grams cannot be negative')
            .optional()
            .nullable(),
        fatsGrams: zod_1.z
            .number()
            .min(0, 'Fats grams cannot be negative')
            .optional()
            .nullable(),
        waterIntake: zod_1.z
            .string()
            .max(100, 'Water intake details cannot exceed 100 characters')
            .optional()
            .nullable(),
        supplements: zod_1.z
            .string()
            .max(500, 'Supplements details cannot exceed 500 characters')
            .optional()
            .nullable(),
        notes: zod_1.z
            .string()
            .max(1000, 'Notes cannot exceed 1000 characters')
            .optional()
            .nullable(),
    }),
});
/**
 * Get diet plan validation
 */
exports.getDietPlanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
    }),
});
/**
 * Toggle workout plan status validation
 */
exports.toggleWorkoutPlanStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workout plan ID is required'),
    }),
});
