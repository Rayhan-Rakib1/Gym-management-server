import { z } from 'zod';

export const createAIMemberProfileSchema = z.object({
    body: z.object({
        age: z.number().int().min(13).max(100).optional(),
        bmi: z.number().positive().optional(),
        fitnessGoals: z.array(z.string()).min(1, 'At least one fitness goal is required'),
        healthConditions: z.array(z.string()).optional().default([]),
        experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        preferredWorkoutTypes: z.array(z.string()).min(1, 'At least one workout type is required'),
        weeklyFrequency: z.number().int().min(1).max(7),
        preferredTime: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).optional(),
        additionalPreferences: z.record(z.string(), z.any()).optional(),
    }),
});

export const updateAIMemberProfileSchema = z.object({
    body: z.object({
        age: z.number().int().min(13).max(100).optional(),
        bmi: z.number().positive().optional(),
        fitnessGoals: z.array(z.string()).optional(),
        healthConditions: z.array(z.string()).optional(),
        experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
        preferredWorkoutTypes: z.array(z.string()).optional(),
        weeklyFrequency: z.number().int().min(1).max(7).optional(),
        preferredTime: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).optional(),
        additionalPreferences: z.record(z.string(), z.any()).optional(),
    }),
});

export const createAITrainerProfileSchema = z.object({
    body: z.object({
        specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
        expertiseLevel: z.array(z.string()).min(1, 'At least one expertise level is required'),
        clientAgeGroups: z.array(z.string()).optional(),
        clientGoalsHandled: z.array(z.string()).optional(),
        strengthAreas: z.record(z.string(), z.any()).optional(),
    }),
});

export const recommendTrainersSchema = z.object({
    body: z.object({
        memberId: z.string().uuid('Invalid member ID').optional(),
        topN: z.number().int().min(1).max(10).optional().default(5),
        filters: z
            .object({
                minRating: z.number().min(0).max(5).optional(),
                isAvailable: z.boolean().optional(),
                maxCapacity: z.boolean().optional(),
            })
            .optional(),
    }),
});

export const respondToRecommendationSchema = z.object({
    body: z.object({
        status: z.enum(['ACCEPTED', 'REJECTED']),
        feedback: z.string().optional(),
    }),
});

export const submitTrainingDataSchema = z.object({
    body: z.object({
        memberId: z.string().uuid('Invalid member ID'),
        trainerId: z.string().uuid('Invalid trainer ID'),
        matchScore: z.number().min(0).max(100),
        goalAchieved: z.boolean(),
        achievementPercentage: z.number().min(0).max(100),
        durationDays: z.number().int().positive(),
        memberSatisfaction: z.number().int().min(1).max(5).optional(),
        memberFeedback: z.string().optional(),
        reasonForSwitch: z.string().optional(),
        performanceMetrics: z.record(z.string(), z.any()).optional(),
    }),
});

export const generateWorkoutPlanSchema = z.object({
    body: z.object({
        trainerId: z.string().min(1, 'Trainer ID is required'),
        durationWeeks: z.number().int().min(4).max(52).optional().default(12),
    }),
});

export type CreateAIMemberProfileInput = z.infer<typeof createAIMemberProfileSchema>['body'];
export type UpdateAIMemberProfileInput = z.infer<typeof updateAIMemberProfileSchema>['body'];
export type CreateAITrainerProfileInput = z.infer<typeof createAITrainerProfileSchema>['body'];
export type RecommendTrainersInput = z.infer<typeof recommendTrainersSchema>['body'];
export type RespondToRecommendationInput = z.infer<typeof respondToRecommendationSchema>['body'];
export type SubmitTrainingDataInput = z.infer<typeof submitTrainingDataSchema>['body'];
