// src/modules/workoutPlan/workoutPlan.validation.ts

import { z } from 'zod';
import { DayOfWeek } from '@prisma/client';

/**
 * Exercise schema for nested validation
 */
const exerciseSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek, {
    message: 'Invalid day of week',
  }),
  exerciseName: z
    .string()
    .min(2, 'Exercise name must be at least 2 characters')
    .max(100, 'Exercise name cannot exceed 100 characters'),
  sets: z
    .number()
    .int('Sets must be an integer')
    .min(1, 'Sets must be at least 1')
    .max(20, 'Sets cannot exceed 20'),
  reps: z
    .number()
    .int('Reps must be an integer')
    .min(1, 'Reps must be at least 1')
    .max(100, 'Reps cannot exceed 100'),
  weight: z
    .number()
    .min(0, 'Weight cannot be negative')
    .optional()
    .nullable(),
  restTime: z
    .number()
    .int('Rest time must be an integer')
    .min(0, 'Rest time cannot be negative')
    .optional()
    .nullable(),
  videoUrl: z
    .string()
    .url('Video URL must be a valid URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
  instructions: z
    .string()
    .max(500, 'Instructions cannot exceed 500 characters')
    .optional()
    .nullable(),
  orderIndex: z
    .number()
    .int()
    .min(0, 'Order index cannot be negative')
    .optional()
    .default(0),
});

/**
 * Create workout plan validation
 */
export const createWorkoutPlanSchema = z.object({
  body: z
    .object({
      memberId: z.string().min(1, 'Member ID is required'),
      trainerId: z.string().optional(), // Optional for trainers (auto-assigned)
      planName: z
        .string()
        .min(3, 'Plan name must be at least 3 characters')
        .max(100, 'Plan name cannot exceed 100 characters'),
      description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional()
        .nullable(),
      startDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      endDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      goals: z.array(z.string()).optional().default([]),
      notes: z
        .string()
        .max(1000, 'Notes cannot exceed 1000 characters')
        .optional()
        .nullable(),
      exercises: z.array(exerciseSchema).optional().default([]),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: 'End date must be after start date',
      path: ['endDate'],
    }),
});

/**
 * Get workout plans query validation
 */
export const getWorkoutPlansQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    trainerId: z.string().optional(),
    memberId: z.string().optional(),
  }),
});

/**
 * Get workout plan by ID validation
 */
export const getWorkoutPlanByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
  }),
});

/**
 * Update workout plan validation
 */
export const updateWorkoutPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
  }),
  body: z
    .object({
      planName: z
        .string()
        .min(3, 'Plan name must be at least 3 characters')
        .max(100, 'Plan name cannot exceed 100 characters')
        .optional(),
      description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional()
        .nullable(),
      startDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val))
        .optional(),
      endDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val))
        .optional(),
      goals: z.array(z.string()).optional(),
      notes: z
        .string()
        .max(1000, 'Notes cannot exceed 1000 characters')
        .optional()
        .nullable(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.endDate > data.startDate;
        }
        return true;
      },
      {
        message: 'End date must be after start date',
        path: ['endDate'],
      }
    ),
});

/**
 * Delete workout plan validation
 */
export const deleteWorkoutPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
  }),
});

/**
 * Get member workout plans validation
 */
export const getMemberWorkoutPlansSchema = z.object({
  params: z.object({
    memberId: z.string().min(1, 'Member ID is required'),
  }),
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
});

/**
 * Get trainer workout plans validation
 */
export const getTrainerWorkoutPlansSchema = z.object({
  params: z.object({
    trainerId: z.string().min(1, 'Trainer ID is required'),
  }),
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
});

/**
 * Add exercise validation
 */
export const addExerciseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
  }),
  body: exerciseSchema,
});

/**
 * Update exercise validation
 */
export const updateExerciseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
    exerciseId: z.string().min(1, 'Exercise ID is required'),
  }),
  body: z.object({
    dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
    exerciseName: z
      .string()
      .min(2, 'Exercise name must be at least 2 characters')
      .max(100, 'Exercise name cannot exceed 100 characters')
      .optional(),
    sets: z
      .number()
      .int()
      .min(1, 'Sets must be at least 1')
      .max(20, 'Sets cannot exceed 20')
      .optional(),
    reps: z
      .number()
      .int()
      .min(1, 'Reps must be at least 1')
      .max(100, 'Reps cannot exceed 100')
      .optional(),
    weight: z.number().min(0, 'Weight cannot be negative').optional().nullable(),
    restTime: z
      .number()
      .int()
      .min(0, 'Rest time cannot be negative')
      .optional()
      .nullable(),
    videoUrl: z
      .string()
      .url('Video URL must be a valid URL')
      .optional()
      .or(z.literal(''))
      .nullable(),
    instructions: z
      .string()
      .max(500, 'Instructions cannot exceed 500 characters')
      .optional()
      .nullable(),
    orderIndex: z.number().int().min(0).optional(),
  }),
});

/**
 * Delete exercise validation
 */
export const deleteExerciseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
    exerciseId: z.string().min(1, 'Exercise ID is required'),
  }),
});

/**
 * Add or update diet plan validation
 */
export const addOrUpdateDietSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
  }),
  body: z.object({
    breakfast: z
      .string()
      .max(500, 'Breakfast details cannot exceed 500 characters')
      .optional()
      .nullable(),
    midMorning: z
      .string()
      .max(500, 'Mid morning details cannot exceed 500 characters')
      .optional()
      .nullable(),
    lunch: z
      .string()
      .max(500, 'Lunch details cannot exceed 500 characters')
      .optional()
      .nullable(),
    evening: z
      .string()
      .max(500, 'Evening details cannot exceed 500 characters')
      .optional()
      .nullable(),
    dinner: z
      .string()
      .max(500, 'Dinner details cannot exceed 500 characters')
      .optional()
      .nullable(),
    totalCalories: z
      .number()
      .int()
      .min(0, 'Total calories cannot be negative')
      .optional()
      .nullable(),
    proteinGrams: z
      .number()
      .min(0, 'Protein grams cannot be negative')
      .optional()
      .nullable(),
    carbsGrams: z
      .number()
      .min(0, 'Carbs grams cannot be negative')
      .optional()
      .nullable(),
    fatsGrams: z
      .number()
      .min(0, 'Fats grams cannot be negative')
      .optional()
      .nullable(),
    waterIntake: z
      .string()
      .max(100, 'Water intake details cannot exceed 100 characters')
      .optional()
      .nullable(),
    supplements: z
      .string()
      .max(500, 'Supplements details cannot exceed 500 characters')
      .optional()
      .nullable(),
    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .optional()
      .nullable(),
  }),
});

/**
 * Get diet plan validation
 */
export const getDietPlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
  }),
});

/**
 * Toggle workout plan status validation
 */
export const toggleWorkoutPlanStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workout plan ID is required'),
  }),
});