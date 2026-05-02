import { DayOfWeek, Specialization } from '@prisma/client';
import { z } from 'zod';

export const createTrainerSchema = z.object({
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
    
    // Trainer Specific
    experienceYears: z.number().min(0).max(50),
    certifications: z.array(z.string()).optional(),
    bio: z.string().max(500).optional(),
    languages: z.array(z.string()).optional(),
    salary: z.number().positive().optional(),
    maxCapacity: z.number().positive().optional().default(20),
    
    // Specializations
    specializations: z
      .array(
        z.object({
          specialization: z.enum([
            Specialization.WEIGHT_TRAINING,
            Specialization.CARDIO,
            Specialization.YOGA,
            Specialization.CROSSFIT,
            Specialization.PILATES,
            Specialization.NUTRITION,
            Specialization.REHABILITATION,
            Specialization.STRENGTH_TRAINING,
            Specialization.FLEXIBILITY,
            Specialization.SPORTS_SPECIFIC,
          ]),
          proficiencyLevel: z.number().min(1).max(10).optional(),
          yearsOfExperience: z.number().min(0).optional(),
        })
      )
      .optional(),
  }),
});

export const updateTrainerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z
      .string()
      .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid phone number')
      .optional(),
    experienceYears: z.number().min(0).max(50).optional(),
    certifications: z.array(z.string()).optional(),
    bio: z.string().max(500).optional(),
    languages: z.array(z.string()).optional(),
    salary: z.number().positive().optional(),
    maxCapacity: z.number().positive().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const addSpecializationSchema = z.object({
  body: z.object({
    specialization: z.enum([
        Specialization.WEIGHT_TRAINING,
        Specialization.CARDIO,
        Specialization.YOGA,
        Specialization.CROSSFIT,
        Specialization.PILATES,
        Specialization.NUTRITION,
        Specialization.REHABILITATION,
        Specialization.STRENGTH_TRAINING,
        Specialization.FLEXIBILITY,
        Specialization.SPORTS_SPECIFIC,
    ]),
    proficiencyLevel: z.number().min(1).max(10).optional().default(5),
    yearsOfExperience: z.number().min(0).optional().default(0),
  }),
});

export const updateSpecializationSchema = z.object({
  body: z.object({
    proficiencyLevel: z.number().min(1).max(10).optional(),
    yearsOfExperience: z.number().min(0).optional(),
  }),
});

export const setAvailabilitySchema = z.object({
  body: z.object({
    dayOfWeek: z.enum([
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ]),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    isAvailable: z.boolean().optional().default(true),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const getTrainersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    specialization: z.string().optional(),
    isAvailable: z.string().transform((val) => val === 'true').optional(),
    minRating: z.string().transform((val) => parseFloat(val)).optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});