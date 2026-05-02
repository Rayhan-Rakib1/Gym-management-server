"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingIdParamSchema = exports.getClassBookingsQuerySchema = exports.getMemberBookingsQuerySchema = exports.bookClassSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
exports.bookClassSchema = zod_1.default.object({
    body: zod_1.default
        .object({
        classId: zod_1.default
            .string({ message: 'Class ID is required' })
            .uuid('Invalid class ID format'),
        scheduleId: zod_1.default
            .string({ message: 'Schedule ID is required' })
            .uuid('Invalid schedule ID format'),
        bookingDate: zod_1.default
            .string({ message: 'Booking date is required' })
            .datetime('Invalid date format')
            .or(zod_1.default.date()),
    })
        .refine((data) => {
        const bookingDate = new Date(data.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today;
    }, {
        message: 'Cannot book classes in the past',
        path: ['bookingDate'],
    })
        .refine((data) => {
        const bookingDate = new Date(data.bookingDate);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return bookingDate <= maxDate;
    }, {
        message: 'Cannot book classes more than 30 days in advance',
        path: ['bookingDate'],
    }),
});
exports.getMemberBookingsQuerySchema = zod_1.default.object({
    params: zod_1.default.object({
        memberId: zod_1.default.string().uuid('Invalid member ID format'),
    }),
    query: zod_1.default.object({
        status: zod_1.default.nativeEnum(client_1.BookingStatus).optional(),
        upcoming: zod_1.default
            .string()
            .transform((val) => val === 'true')
            .optional(),
        page: zod_1.default.string().optional().default('1'),
        limit: zod_1.default.string().optional().default('10'),
    }),
});
exports.getClassBookingsQuerySchema = zod_1.default.object({
    params: zod_1.default.object({
        classId: zod_1.default.string().uuid('Invalid class ID format'),
    }),
    query: zod_1.default.object({
        date: zod_1.default.string().datetime().optional().or(zod_1.default.date().optional()),
        status: zod_1.default.nativeEnum(client_1.BookingStatus).optional(),
        page: zod_1.default.string().optional().default('1'),
        limit: zod_1.default.string().optional().default('10'),
    }),
});
exports.bookingIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string().uuid('Invalid booking ID format'),
    }),
});
