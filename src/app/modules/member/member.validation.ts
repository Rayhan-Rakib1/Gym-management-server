import { Gender, PaymentMethod, PreferredTime, WorkoutExperience } from '@prisma/client';
import { z } from 'zod';

export const createMemberSchema = z.object({
    body: z.object({
        // User Info
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain uppercase, lowercase, and number'
            ),
        phone: z
            .string()
            .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number')
            .optional(),

        // Member Specific
        dateOfBirth: z.string().optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
        height: z.number().positive().optional(),
        currentWeight: z.number().positive().optional(),
        targetWeight: z.number().positive().optional(),
        bloodGroup: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyContactName: z.string().optional(),
        address: z.string().optional(),

        // Membership
        currentPlanId: z.string().uuid().optional(),
    }),
});

export const updateMemberSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        phone: z
            .string()
            .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid phone number')
            .optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
        height: z.number().positive().optional(),
        currentWeight: z.number().positive().optional(),
        targetWeight: z.number().positive().optional(),
        bloodGroup: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyContactName: z.string().optional(),
        address: z.string().optional(),
    }),
});

export const updateFitnessProfileSchema = z.object({
    body: z.object({
        fitnessGoals: z.array(z.string()).optional(),
        healthConditions: z.array(z.string()).optional(),
        workoutExperience: z.enum([WorkoutExperience.BEGINNER, WorkoutExperience.INTERMEDIATE, WorkoutExperience.ADVANCED]).optional(),
        preferredWorkoutStyle: z.array(z.string()).optional(),
        weeklyFrequency: z.number().min(1).max(7).optional(),
        preferredTime: z.enum([PreferredTime.MORNING, PreferredTime.AFTERNOON, PreferredTime.EVENING]).optional(),
    }),
});

export const assignTrainerSchema = z.object({
    body: z.object({
        trainerId: z.string().uuid('Invalid trainer ID'),
    }),
});

export const updateMemberPlanSchema = z.object({
    body: z.object({
        planId: z.string().uuid('Invalid plan ID'),
    }),
});

export const renewMembershipSchema = z.object({
    body: z.object({
        planId: z.string().uuid('Invalid plan ID'),
        paymentMethod: z.enum([PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.BKASH, PaymentMethod.NAGAD, PaymentMethod.SSLCOMMERZ, PaymentMethod.STRIPE]),
    }),
});

export const getMembersQuerySchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        search: z.string().optional(),
        planId: z.string().uuid().optional(),
        trainerId: z.string().uuid().optional(),
        isActive: z.string().transform((val) => val === 'true').optional(),
        workoutExperience: z.enum([WorkoutExperience.BEGINNER, WorkoutExperience.INTERMEDIATE, WorkoutExperience.ADVANCED]).optional(),
        sortBy: z.string().optional().default('createdAt'),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
