import { z } from 'zod';

export const createPaymentSchema = z.object({
    body: z.object({
        memberId: z.string().uuid('Invalid member ID'),
        planId: z.string().uuid('Invalid plan ID'),
        paymentMethod: z.enum(['CASH', 'CARD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE']),
        discount: z.number().min(0).max(100).optional().default(0),
        notes: z.string().optional(),
    }),
});

export const initiatePaymentSchema = z.object({
    body: z.object({
        memberId: z.string().uuid('Invalid member ID'),
        planId: z.string().uuid('Invalid plan ID'),
        paymentMethod: z.enum(['SSLCOMMERZ', 'STRIPE', 'BKASH', 'NAGAD']),
        successUrl: z.string().url('Invalid success URL').optional(),
        failUrl: z.string().url('Invalid fail URL').optional(),
        cancelUrl: z.string().url('Invalid cancel URL').optional(),
    }),
});

export const updatePaymentStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED', 'REFUNDED']),
        notes: z.string().optional(),
    }),
});

export const processRefundSchema = z.object({
    body: z.object({
        reason: z.string().min(10, 'Refund reason must be at least 10 characters'),
        amount: z.number().positive('Amount must be positive').optional(),
    }),
});

export const getPaymentsQuerySchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        search: z.string().optional(),
        memberId: z.string().uuid().optional(),
        planId: z.string().uuid().optional(),
        status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
        paymentMethod: z.enum(['CASH', 'CARD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        sortBy: z.string().optional().default('createdAt'),
        order: z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>['body'];
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>['body'];
export type ProcessRefundInput = z.infer<typeof processRefundSchema>['body'];
export type GetPaymentsQueryInput = z.infer<typeof getPaymentsQuerySchema>['query'];
