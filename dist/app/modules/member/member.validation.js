"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMembersQuerySchema = exports.renewMembershipSchema = exports.updateMemberPlanSchema = exports.assignTrainerSchema = exports.updateFitnessProfileSchema = exports.updateMemberSchema = exports.createMemberSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        // User Info
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
        phone: zod_1.z
            .string()
            .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number')
            .optional(),
        // Member Specific
        dateOfBirth: zod_1.z.string().optional(),
        gender: zod_1.z.enum([client_1.Gender.MALE, client_1.Gender.FEMALE, client_1.Gender.OTHER]).optional(),
        height: zod_1.z.number().positive().optional(),
        currentWeight: zod_1.z.number().positive().optional(),
        targetWeight: zod_1.z.number().positive().optional(),
        bloodGroup: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.string().optional(),
        emergencyContactName: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        // Membership
        currentPlanId: zod_1.z.string().uuid().optional(),
    }),
});
exports.updateMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        phone: zod_1.z
            .string()
            .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid phone number')
            .optional(),
        dateOfBirth: zod_1.z.string().optional(),
        gender: zod_1.z.enum([client_1.Gender.MALE, client_1.Gender.FEMALE, client_1.Gender.OTHER]).optional(),
        height: zod_1.z.number().positive().optional(),
        currentWeight: zod_1.z.number().positive().optional(),
        targetWeight: zod_1.z.number().positive().optional(),
        bloodGroup: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.string().optional(),
        emergencyContactName: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }),
});
exports.updateFitnessProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        fitnessGoals: zod_1.z.array(zod_1.z.string()).optional(),
        healthConditions: zod_1.z.array(zod_1.z.string()).optional(),
        workoutExperience: zod_1.z.enum([client_1.WorkoutExperience.BEGINNER, client_1.WorkoutExperience.INTERMEDIATE, client_1.WorkoutExperience.ADVANCED]).optional(),
        preferredWorkoutStyle: zod_1.z.array(zod_1.z.string()).optional(),
        weeklyFrequency: zod_1.z.number().min(1).max(7).optional(),
        preferredTime: zod_1.z.enum([client_1.PreferredTime.MORNING, client_1.PreferredTime.AFTERNOON, client_1.PreferredTime.EVENING]).optional(),
    }),
});
exports.assignTrainerSchema = zod_1.z.object({
    body: zod_1.z.object({
        trainerId: zod_1.z.string().uuid('Invalid trainer ID'),
    }),
});
exports.updateMemberPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string().uuid('Invalid plan ID'),
    }),
});
exports.renewMembershipSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string().uuid('Invalid plan ID'),
        paymentMethod: zod_1.z.enum([client_1.PaymentMethod.CASH, client_1.PaymentMethod.CARD, client_1.PaymentMethod.BKASH, client_1.PaymentMethod.NAGAD, client_1.PaymentMethod.SSLCOMMERZ, client_1.PaymentMethod.STRIPE]),
    }),
});
exports.getMembersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        planId: zod_1.z.string().uuid().optional(),
        trainerId: zod_1.z.string().uuid().optional(),
        isActive: zod_1.z.string().transform((val) => val === 'true').optional(),
        workoutExperience: zod_1.z.enum([client_1.WorkoutExperience.BEGINNER, client_1.WorkoutExperience.INTERMEDIATE, client_1.WorkoutExperience.ADVANCED]).optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
