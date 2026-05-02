"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const http_status_1 = __importDefault(require("http-status"));
const invoiceGenerator_1 = require("../../../utils/invoiceGenerator");
const sslcommerz_1 = require("../../../utils/sslcommerz");
const sendEmail_1 = require("../../../utils/sendEmail");
class PaymentService {
    static async getAllPayments(query) {
        const { page = '1', limit = '10', search, memberId, planId, status, paymentMethod, startDate, endDate, sortBy = 'createdAt', order = 'desc', } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { transactionId: { contains: search, mode: 'insensitive' } },
                { member: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { member: { user: { email: { contains: search, mode: 'insensitive' } } } },
            ];
        }
        if (memberId)
            where.memberId = memberId;
        if (planId)
            where.planId = planId;
        if (status)
            where.status = status;
        if (paymentMethod)
            where.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate)
                where.paymentDate.gte = new Date(startDate);
            if (endDate)
                where.paymentDate.lte = new Date(endDate);
        }
        const total = await prisma_1.default.payment.count({ where });
        const payments = await prisma_1.default.payment.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { [sortBy]: order },
            include: {
                member: {
                    include: {
                        user: {
                            select: { name: true, email: true, phone: true },
                        },
                    },
                },
                plan: {
                    select: { name: true, durationDays: true },
                },
            },
        });
        return {
            payments,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNext: pageNum < Math.ceil(total / limitNum),
                hasPrev: pageNum > 1,
            },
        };
    }
    static async getPaymentById(paymentId) {
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: paymentId },
            include: {
                member: {
                    include: {
                        user: {
                            select: { name: true, email: true, phone: true, profileImage: true },
                        },
                    },
                },
                plan: true,
            },
        });
        if (!payment) {
            throw new ApiError_1.AppError('Payment not found', http_status_1.default.NOT_FOUND);
        }
        return payment;
    }
    static async createPayment(data, createdBy) {
        const { memberId, planId, paymentMethod, discount = 0, notes } = data;
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
            include: { user: true },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        const plan = await prisma_1.default.membershipPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        if (!plan.isActive) {
            throw new ApiError_1.AppError('This membership plan is not active', http_status_1.default.BAD_REQUEST);
        }
        const amount = plan.price;
        const planDiscount = (amount * plan.discount) / 100;
        const additionalDiscount = (amount * discount) / 100;
        const totalDiscount = planDiscount + additionalDiscount;
        const tax = 0;
        const finalAmount = amount - totalDiscount + tax;
        const invoiceNumber = await (0, invoiceGenerator_1.generateInvoiceNumber)();
        const membershipStartDate = new Date();
        const membershipEndDate = new Date();
        membershipEndDate.setDate(membershipEndDate.getDate() + plan.durationDays);
        const payment = await prisma_1.default.$transaction(async (tx) => {
            const newPayment = await tx.payment.create({
                data: {
                    memberId,
                    planId,
                    amount,
                    discount: totalDiscount,
                    tax,
                    finalAmount,
                    paymentMethod,
                    status: 'PAID',
                    paymentDate: new Date(),
                    invoiceNumber,
                    notes,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        },
                    },
                    plan: true,
                },
            });
            await tx.member.update({
                where: { id: memberId },
                data: {
                    currentPlanId: planId,
                    membershipStartDate,
                    membershipEndDate,
                },
            });
            return newPayment;
        });
        await this.sendPaymentConfirmationEmail(payment);
        return payment;
    }
    static async initiatePayment(data) {
        const { memberId, planId, paymentMethod, successUrl, failUrl, cancelUrl } = data;
        const [member, plan] = await Promise.all([
            prisma_1.default.member.findUnique({
                where: { id: memberId },
                include: { user: true },
            }),
            prisma_1.default.membershipPlan.findUnique({
                where: { id: planId },
            }),
        ]);
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        const amount = plan.price;
        const discount = (amount * plan.discount) / 100;
        const finalAmount = amount - discount;
        const invoiceNumber = await (0, invoiceGenerator_1.generateInvoiceNumber)();
        const payment = await prisma_1.default.payment.create({
            data: {
                memberId,
                planId,
                amount,
                discount,
                tax: 0,
                finalAmount,
                paymentMethod,
                status: 'PENDING',
                invoiceNumber,
            },
        });
        let gatewayResponse;
        if (paymentMethod === 'SSLCOMMERZ') {
            gatewayResponse = await (0, sslcommerz_1.initiateSSLCommerzPayment)({
                transactionId: payment.id,
                amount: finalAmount,
                customerName: member.user.name,
                customerEmail: member.user.email,
                customerPhone: member.user.phone || '',
                productName: plan.name,
                successUrl: successUrl || `${process.env.FRONTEND_URL}/payment/success`,
                failUrl: failUrl || `${process.env.FRONTEND_URL}/payment/fail`,
                cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
            });
        }
        else if (paymentMethod === 'STRIPE') {
            throw new ApiError_1.AppError('Stripe integration coming soon', http_status_1.default.NOT_IMPLEMENTED);
        }
        else {
            throw new ApiError_1.AppError('Invalid payment method for online payment', http_status_1.default.BAD_REQUEST);
        }
        await prisma_1.default.payment.update({
            where: { id: payment.id },
            data: {
                gatewayResponse: gatewayResponse,
            },
        });
        return {
            paymentId: payment.id,
            gatewayUrl: gatewayResponse.GatewayPageURL,
            sessionKey: gatewayResponse.sessionkey,
        };
    }
    static async handlePaymentSuccess(transactionId, gatewayData) {
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: transactionId },
            include: {
                member: true,
                plan: true,
            },
        });
        if (!payment) {
            throw new ApiError_1.AppError('Payment not found', http_status_1.default.NOT_FOUND);
        }
        if (payment.status === 'PAID') {
            return payment;
        }
        const membershipStartDate = new Date();
        const membershipEndDate = new Date();
        membershipEndDate.setDate(membershipEndDate.getDate() + payment.plan.durationDays);
        const updatedPayment = await prisma_1.default.$transaction(async (tx) => {
            const updated = await tx.payment.update({
                where: { id: transactionId },
                data: {
                    status: 'PAID',
                    paymentDate: new Date(),
                    transactionId: gatewayData.tran_id || gatewayData.bank_tran_id,
                    gatewayResponse: gatewayData,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        },
                    },
                    plan: true,
                },
            });
            await tx.member.update({
                where: { id: payment.memberId },
                data: {
                    currentPlanId: payment.planId,
                    membershipStartDate,
                    membershipEndDate,
                },
            });
            return updated;
        });
        await this.sendPaymentConfirmationEmail(updatedPayment);
        return updatedPayment;
    }
    static async handlePaymentFailure(transactionId, gatewayData) {
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: transactionId },
        });
        if (!payment) {
            throw new ApiError_1.AppError('Payment not found', http_status_1.default.NOT_FOUND);
        }
        await prisma_1.default.payment.update({
            where: { id: transactionId },
            data: {
                status: 'CANCELLED',
                gatewayResponse: gatewayData,
            },
        });
        return { message: 'Payment cancelled' };
    }
    static async updatePaymentStatus(paymentId, data, updatedBy) {
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new ApiError_1.AppError('Payment not found', http_status_1.default.NOT_FOUND);
        }
        const updated = await prisma_1.default.payment.update({
            where: { id: paymentId },
            data: {
                status: data.status,
                notes: data.notes,
            },
        });
        return updated;
    }
    static async processRefund(paymentId, data, processedBy) {
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: paymentId },
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
                plan: true,
            },
        });
        if (!payment) {
            throw new ApiError_1.AppError('Payment not found', http_status_1.default.NOT_FOUND);
        }
        if (payment.status !== 'PAID') {
            throw new ApiError_1.AppError('Only paid payments can be refunded', http_status_1.default.BAD_REQUEST);
        }
        const refundAmount = data.amount || payment.finalAmount;
        if (refundAmount > payment.finalAmount) {
            throw new ApiError_1.AppError('Refund amount cannot exceed payment amount', http_status_1.default.BAD_REQUEST);
        }
        const refunded = await prisma_1.default.payment.update({
            where: { id: paymentId },
            data: {
                status: 'REFUNDED',
                notes: `Refunded: ${data.reason}. Amount: ৳${refundAmount}`,
            },
        });
        await (0, sendEmail_1.sendEmail)({
            to: payment.member.user.email,
            subject: 'Refund Processed - PowerFit Gym',
            html: `
        <h1>Refund Processed</h1>
        <p>Hi ${payment.member.user.name},</p>
        <p>Your refund has been processed successfully.</p>
        <p><strong>Refund Amount:</strong> ৳${refundAmount}</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p>The amount will be credited to your account within 7-10 business days.</p>
      `,
        });
        return refunded;
    }
    static async getPaymentStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate)
                where.paymentDate.gte = new Date(startDate);
            if (endDate)
                where.paymentDate.lte = new Date(endDate);
        }
        const [totalPayments, paidPayments, pendingPayments, overduePayments, totalRevenue, revenueByMethod, revenueByPlan, recentPayments,] = await Promise.all([
            prisma_1.default.payment.count({ where }),
            prisma_1.default.payment.count({ where: { ...where, status: 'PAID' } }),
            prisma_1.default.payment.count({ where: { ...where, status: 'PENDING' } }),
            prisma_1.default.payment.count({ where: { ...where, status: 'OVERDUE' } }),
            prisma_1.default.payment.aggregate({
                where: { ...where, status: 'PAID' },
                _sum: { finalAmount: true },
            }),
            prisma_1.default.payment.groupBy({
                by: ['paymentMethod'],
                where: { ...where, status: 'PAID' },
                _sum: { finalAmount: true },
                _count: true,
            }),
            prisma_1.default.payment.groupBy({
                by: ['planId'],
                where: { ...where, status: 'PAID', planId: { not: null } },
                _sum: { finalAmount: true },
                _count: true,
            }),
            prisma_1.default.payment.findMany({
                where: { ...where, status: 'PAID' },
                take: 5,
                orderBy: { paymentDate: 'desc' },
                include: {
                    member: {
                        include: {
                            user: {
                                select: { name: true },
                            },
                        },
                    },
                    plan: {
                        select: { name: true },
                    },
                },
            }),
        ]);
        const revenueByPlanWithDetails = await Promise.all(revenueByPlan.map(async (item) => {
            const plan = await prisma_1.default.membershipPlan.findUnique({
                where: { id: item.planId },
                select: { name: true },
            });
            return {
                planId: item.planId,
                planName: plan?.name || 'Unknown',
                revenue: item._sum.finalAmount || 0,
                count: item._count,
            };
        }));
        return {
            totalPayments,
            paidPayments,
            pendingPayments,
            overduePayments,
            cancelledPayments: totalPayments - paidPayments - pendingPayments - overduePayments,
            totalRevenue: totalRevenue._sum.finalAmount || 0,
            revenueByMethod: revenueByMethod.map((item) => ({
                method: item.paymentMethod,
                revenue: item._sum.finalAmount || 0,
                count: item._count,
            })),
            revenueByPlan: revenueByPlanWithDetails,
            recentPayments: recentPayments.map((payment) => ({
                id: payment.id,
                invoiceNumber: payment.invoiceNumber,
                memberName: payment.member.user.name,
                planName: payment.plan?.name || 'N/A',
                amount: payment.finalAmount,
                date: payment.paymentDate,
            })),
        };
    }
    static async getOverduePayments() {
        const now = new Date();
        const payments = await prisma_1.default.payment.findMany({
            where: {
                status: 'PENDING',
                dueDate: {
                    lt: now,
                },
            },
            include: {
                member: {
                    include: {
                        user: {
                            select: { name: true, email: true, phone: true },
                        },
                    },
                },
                plan: {
                    select: { name: true },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
        await prisma_1.default.payment.updateMany({
            where: {
                id: { in: payments.map((p) => p.id) },
            },
            data: {
                status: 'OVERDUE',
            },
        });
        return payments;
    }
    static async sendPaymentConfirmationEmail(payment) {
        await (0, sendEmail_1.sendEmail)({
            to: payment.member.user.email,
            subject: 'Payment Confirmation - GymFlow',
            html: `
        <h1>Payment Successful!</h1>
        <p>Hi ${payment.member.user.name},</p>
        <p>Thank you for your payment. Your membership has been activated.</p>
        <hr>
        <h2>Payment Details:</h2>
        <p><strong>Invoice Number:</strong> ${payment.invoiceNumber}</p>
        <p><strong>Plan:</strong> ${payment.plan.name}</p>
        <p><strong>Amount Paid:</strong> ৳${payment.finalAmount}</p>
        <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
        <p><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
        <hr>
        <p>Thank you for choosing GymFlow Gym!</p>
      `,
        });
    }
}
exports.PaymentService = PaymentService;
