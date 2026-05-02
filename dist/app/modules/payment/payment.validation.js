"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsQuerySchema = exports.processRefundSchema = exports.updatePaymentStatusSchema = exports.initiatePaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID'),
        planId: zod_1.z.string().uuid('Invalid plan ID'),
        paymentMethod: zod_1.z.enum(['CASH', 'CARD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE']),
        discount: zod_1.z.number().min(0).max(100).optional().default(0),
        notes: zod_1.z.string().optional(),
    }),
});
exports.initiatePaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        memberId: zod_1.z.string().uuid('Invalid member ID'),
        planId: zod_1.z.string().uuid('Invalid plan ID'),
        paymentMethod: zod_1.z.enum(['SSLCOMMERZ', 'STRIPE', 'BKASH', 'NAGAD']),
        successUrl: zod_1.z.string().url('Invalid success URL').optional(),
        failUrl: zod_1.z.string().url('Invalid fail URL').optional(),
        cancelUrl: zod_1.z.string().url('Invalid cancel URL').optional(),
    }),
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED', 'REFUNDED']),
        notes: zod_1.z.string().optional(),
    }),
});
exports.processRefundSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string().min(10, 'Refund reason must be at least 10 characters'),
        amount: zod_1.z.number().positive('Amount must be positive').optional(),
    }),
});
exports.getPaymentsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        memberId: zod_1.z.string().uuid().optional(),
        planId: zod_1.z.string().uuid().optional(),
        status: zod_1.z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
        paymentMethod: zod_1.z.enum(['CASH', 'CARD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE']).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
