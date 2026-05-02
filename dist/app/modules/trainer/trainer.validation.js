"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrainersQuerySchema = exports.updateAvailabilitySchema = exports.setAvailabilitySchema = exports.updateSpecializationSchema = exports.addSpecializationSchema = exports.updateTrainerSchema = exports.createTrainerSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createTrainerSchema = zod_1.z.object({
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
        // Trainer Specific
        experienceYears: zod_1.z.number().min(0).max(50),
        certifications: zod_1.z.array(zod_1.z.string()).optional(),
        bio: zod_1.z.string().max(500).optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional(),
        salary: zod_1.z.number().positive().optional(),
        maxCapacity: zod_1.z.number().positive().optional().default(20),
        // Specializations
        specializations: zod_1.z
            .array(zod_1.z.object({
            specialization: zod_1.z.enum([
                client_1.Specialization.WEIGHT_TRAINING,
                client_1.Specialization.CARDIO,
                client_1.Specialization.YOGA,
                client_1.Specialization.CROSSFIT,
                client_1.Specialization.PILATES,
                client_1.Specialization.NUTRITION,
                client_1.Specialization.REHABILITATION,
                client_1.Specialization.STRENGTH_TRAINING,
                client_1.Specialization.FLEXIBILITY,
                client_1.Specialization.SPORTS_SPECIFIC,
            ]),
            proficiencyLevel: zod_1.z.number().min(1).max(10).optional(),
            yearsOfExperience: zod_1.z.number().min(0).optional(),
        }))
            .optional(),
    }),
});
exports.updateTrainerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        phone: zod_1.z
            .string()
            .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid phone number')
            .optional(),
        experienceYears: zod_1.z.number().min(0).max(50).optional(),
        certifications: zod_1.z.array(zod_1.z.string()).optional(),
        bio: zod_1.z.string().max(500).optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional(),
        salary: zod_1.z.number().positive().optional(),
        maxCapacity: zod_1.z.number().positive().optional(),
        isAvailable: zod_1.z.boolean().optional(),
    }),
});
exports.addSpecializationSchema = zod_1.z.object({
    body: zod_1.z.object({
        specialization: zod_1.z.enum([
            client_1.Specialization.WEIGHT_TRAINING,
            client_1.Specialization.CARDIO,
            client_1.Specialization.YOGA,
            client_1.Specialization.CROSSFIT,
            client_1.Specialization.PILATES,
            client_1.Specialization.NUTRITION,
            client_1.Specialization.REHABILITATION,
            client_1.Specialization.STRENGTH_TRAINING,
            client_1.Specialization.FLEXIBILITY,
            client_1.Specialization.SPORTS_SPECIFIC,
        ]),
        proficiencyLevel: zod_1.z.number().min(1).max(10).optional().default(5),
        yearsOfExperience: zod_1.z.number().min(0).optional().default(0),
    }),
});
exports.updateSpecializationSchema = zod_1.z.object({
    body: zod_1.z.object({
        proficiencyLevel: zod_1.z.number().min(1).max(10).optional(),
        yearsOfExperience: zod_1.z.number().min(0).optional(),
    }),
});
exports.setAvailabilitySchema = zod_1.z.object({
    body: zod_1.z.object({
        dayOfWeek: zod_1.z.enum([
            client_1.DayOfWeek.SUNDAY,
            client_1.DayOfWeek.MONDAY,
            client_1.DayOfWeek.TUESDAY,
            client_1.DayOfWeek.WEDNESDAY,
            client_1.DayOfWeek.THURSDAY,
            client_1.DayOfWeek.FRIDAY,
            client_1.DayOfWeek.SATURDAY,
        ]),
        startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        isAvailable: zod_1.z.boolean().optional().default(true),
    }),
});
exports.updateAvailabilitySchema = zod_1.z.object({
    body: zod_1.z.object({
        startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
        endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
        isAvailable: zod_1.z.boolean().optional(),
    }),
});
exports.getTrainersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        specialization: zod_1.z.string().optional(),
        isAvailable: zod_1.z.string().transform((val) => val === 'true').optional(),
        minRating: zod_1.z.string().transform((val) => parseFloat(val)).optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
