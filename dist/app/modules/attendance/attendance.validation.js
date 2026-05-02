"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceStatsSchema = exports.getAttendanceQuerySchema = exports.manualAttendanceSchema = exports.checkOutSchema = exports.checkInSchema = void 0;
const zod_1 = require("zod");
exports.checkInSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID'),
        notes: zod_1.z.string().optional(),
    }),
});
exports.checkOutSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID'),
        notes: zod_1.z.string().optional(),
    }),
});
exports.manualAttendanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID'),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        checkInTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
        checkOutTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.getAttendanceQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        memberId: zod_1.z.string().uuid().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional().default('date'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
exports.getAttendanceStatsSchema = zod_1.z.object({
    query: zod_1.z.object({
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    }),
});
