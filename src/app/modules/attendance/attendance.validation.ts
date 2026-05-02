import { z } from 'zod';

export const checkInSchema = z.object({
  body: z.object({
    memberId: z.string().uuid('Invalid member ID'),
    notes: z.string().optional(),
  }),
});

export const checkOutSchema = z.object({
  body: z.object({
    memberId: z.string().uuid('Invalid member ID'),
    notes: z.string().optional(),
  }),
});

export const manualAttendanceSchema = z.object({
  body: z.object({
    memberId: z.string().uuid('Invalid member ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
    notes: z.string().optional(),
  }),
});

export const getAttendanceQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    memberId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.string().optional().default('date'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const getAttendanceStatsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
