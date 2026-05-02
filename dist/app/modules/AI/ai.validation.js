"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkoutPlanSchema = exports.submitTrainingDataSchema = exports.respondToRecommendationSchema = exports.recommendTrainersSchema = exports.createAITrainerProfileSchema = exports.updateAIMemberProfileSchema = exports.createAIMemberProfileSchema = void 0;
const zod_1 = require("zod");
exports.createAIMemberProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        age: zod_1.z.number().int().min(13).max(100).optional(),
        bmi: zod_1.z.number().positive().optional(),
        fitnessGoals: zod_1.z.array(zod_1.z.string()).min(1, 'At least one fitness goal is required'),
        healthConditions: zod_1.z.array(zod_1.z.string()).optional().default([]),
        experienceLevel: zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        preferredWorkoutTypes: zod_1.z.array(zod_1.z.string()).min(1, 'At least one workout type is required'),
        weeklyFrequency: zod_1.z.number().int().min(1).max(7),
        preferredTime: zod_1.z.enum(['MORNING', 'AFTERNOON', 'EVENING']).optional(),
        additionalPreferences: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
exports.updateAIMemberProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        age: zod_1.z.number().int().min(13).max(100).optional(),
        bmi: zod_1.z.number().positive().optional(),
        fitnessGoals: zod_1.z.array(zod_1.z.string()).optional(),
        healthConditions: zod_1.z.array(zod_1.z.string()).optional(),
        experienceLevel: zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
        preferredWorkoutTypes: zod_1.z.array(zod_1.z.string()).optional(),
        weeklyFrequency: zod_1.z.number().int().min(1).max(7).optional(),
        preferredTime: zod_1.z.enum(['MORNING', 'AFTERNOON', 'EVENING']).optional(),
        additionalPreferences: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
exports.createAITrainerProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        specializations: zod_1.z.array(zod_1.z.string()).min(1, 'At least one specialization is required'),
        expertiseLevel: zod_1.z.array(zod_1.z.string()).min(1, 'At least one expertise level is required'),
        clientAgeGroups: zod_1.z.array(zod_1.z.string()).optional(),
        clientGoalsHandled: zod_1.z.array(zod_1.z.string()).optional(),
        strengthAreas: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
exports.recommendTrainersSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID').optional(),
        topN: zod_1.z.number().int().min(1).max(10).optional().default(5),
        filters: zod_1.z
            .object({
            minRating: zod_1.z.number().min(0).max(5).optional(),
            isAvailable: zod_1.z.boolean().optional(),
            maxCapacity: zod_1.z.boolean().optional(),
        })
            .optional(),
    }),
});
exports.respondToRecommendationSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['ACCEPTED', 'REJECTED']),
        feedback: zod_1.z.string().optional(),
    }),
});
exports.submitTrainingDataSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID'),
        trainerId: zod_1.z.string().uuid('Invalid trainer ID'),
        matchScore: zod_1.z.number().min(0).max(100),
        goalAchieved: zod_1.z.boolean(),
        achievementPercentage: zod_1.z.number().min(0).max(100),
        durationDays: zod_1.z.number().int().positive(),
        memberSatisfaction: zod_1.z.number().int().min(1).max(5).optional(),
        memberFeedback: zod_1.z.string().optional(),
        reasonForSwitch: zod_1.z.string().optional(),
        performanceMetrics: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
exports.generateWorkoutPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        trainerId: zod_1.z.string().min(1, 'Trainer ID is required'),
        durationWeeks: zod_1.z.number().int().min(4).max(52).optional().default(12),
    }),
});
