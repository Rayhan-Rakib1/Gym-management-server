"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const client_1 = require("@prisma/client");
class PlanService {
    /**
     * Get all membership plans with filters and pagination
     */
    static async getAllPlans(query) {
        const { page = '1', limit = '10', search, isActive, isPopular, minPrice, maxPrice, sortBy = 'createdAt', order = 'desc', } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (isPopular !== undefined) {
            where.isPopular = isPopular;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }
        // Get total count
        const total = await prisma_1.default.membershipPlan.count({ where });
        // Get plans
        const plans = await prisma_1.default.membershipPlan.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: {
                [sortBy]: order,
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        payments: true,
                    },
                },
            },
        });
        return {
            plans,
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
    /**
     * Get active plans only (for public display)
     */
    static async getActivePlans() {
        const plans = await prisma_1.default.membershipPlan.findMany({
            where: { isActive: true },
            orderBy: [
                { isPopular: 'desc' }, // Popular plans first
                { price: 'asc' }, // Then by price
            ],
            include: {
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });
        return plans;
    }
    /**
     * Get popular plans
     */
    static async getPopularPlans() {
        const plans = await prisma_1.default.membershipPlan.findMany({
            where: {
                isActive: true,
                isPopular: true,
            },
            orderBy: { price: 'asc' },
            include: {
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });
        return plans;
    }
    /**
     * Get plan by ID
     */
    static async getPlanById(planId) {
        const plan = await prisma_1.default.membershipPlan.findUnique({
            where: { id: planId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                profileImage: true,
                            },
                        },
                    },
                    take: 10,
                    orderBy: { joinDate: 'desc' },
                },
                payments: {
                    where: {
                        status: client_1.PaymentStatus.PAID,
                    },
                    orderBy: { paymentDate: 'desc' },
                    take: 10,
                },
                _count: {
                    select: {
                        members: true,
                        payments: true,
                    },
                },
            },
        });
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        return plan;
    }
    /**
     * Create new membership plan
     */
    static async createPlan(data, createdBy) {
        const { name, description, durationDays, price, features, personalTrainingSessions, discount, isPopular, } = data;
        // Check if plan name already exists
        const existingPlan = await prisma_1.default.membershipPlan.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
        });
        if (existingPlan) {
            throw new ApiError_1.AppError('Plan with this name already exists', http_status_1.default.BAD_REQUEST);
        }
        // If this plan is marked as popular, unmark other popular plans
        if (isPopular) {
            await prisma_1.default.membershipPlan.updateMany({
                where: { isPopular: true },
                data: { isPopular: false },
            });
        }
        const plan = await prisma_1.default.$transaction(async (tx) => {
            const newPlan = await tx.membershipPlan.create({
                data: {
                    name,
                    description,
                    durationDays,
                    price,
                    features,
                    personalTrainingSessions,
                    discount,
                    isPopular: isPopular || false,
                    isActive: true,
                },
            });
            return newPlan;
        });
        return plan;
    }
    /**
     * Update membership plan
     */
    static async updatePlan(planId, data, updatedBy) {
        const plan = await prisma_1.default.membershipPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        // Check if name already exists (if name is being updated)
        if (data.name && data.name !== plan.name) {
            const existingPlan = await prisma_1.default.membershipPlan.findFirst({
                where: {
                    name: {
                        equals: data.name,
                        mode: 'insensitive',
                    },
                    NOT: { id: planId },
                },
            });
            if (existingPlan) {
                throw new ApiError_1.AppError('Plan with this name already exists', http_status_1.default.BAD_REQUEST);
            }
        }
        const updated = await prisma_1.default.$transaction(async (tx) => {
            // If marking as popular, unmark other popular plans
            if (data.isPopular === true) {
                await tx.membershipPlan.updateMany({
                    where: {
                        isPopular: true,
                        NOT: { id: planId },
                    },
                    data: { isPopular: false },
                });
            }
            const updatedPlan = await tx.membershipPlan.update({
                where: { id: planId },
                data: {
                    name: data.name,
                    description: data.description,
                    durationDays: data.durationDays,
                    price: data.price,
                    features: data.features,
                    personalTrainingSessions: data.personalTrainingSessions,
                    discount: data.discount,
                    isPopular: data.isPopular,
                },
            });
            return updatedPlan;
        });
        return updated;
    }
    /**
     * Toggle plan status (activate/deactivate)
     */
    static async togglePlanStatus(planId, data, updatedBy) {
        const plan = await prisma_1.default.membershipPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        // Check if plan has active members before deactivating
        if (!data.isActive) {
            const activeMembers = await prisma_1.default.member.count({
                where: {
                    currentPlanId: planId,
                    user: { isActive: true },
                },
            });
            if (activeMembers > 0) {
                throw new ApiError_1.AppError(`Cannot deactivate plan. ${activeMembers} active member(s) are using this plan.`, http_status_1.default.BAD_REQUEST);
            }
        }
        const updated = await prisma_1.default.$transaction(async (tx) => {
            const updatedPlan = await tx.membershipPlan.update({
                where: { id: planId },
                data: { isActive: data.isActive },
            });
            return updatedPlan;
        });
        return updated;
    }
    /**
     * Delete membership plan
     */
    static async deletePlan(planId, deletedBy) {
        const plan = await prisma_1.default.membershipPlan.findUnique({
            where: { id: planId },
            include: {
                _count: {
                    select: {
                        members: true,
                        payments: true,
                    },
                },
            },
        });
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        // Check if plan has any members or payments
        if (plan._count.members > 0) {
            throw new ApiError_1.AppError(`Cannot delete plan. ${plan._count.members} member(s) are using this plan.`, http_status_1.default.BAD_REQUEST);
        }
        if (plan._count.payments > 0) {
            throw new ApiError_1.AppError('Cannot delete plan with existing payment records. Consider deactivating instead.', http_status_1.default.BAD_REQUEST);
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.membershipPlan.delete({
                where: { id: planId },
            });
        });
        return { message: 'Membership plan deleted successfully' };
    }
    /**
     * Get plan members
     */
    static async getPlanMembers(planId, page = 1, limit = 10) {
        const plan = await prisma_1.default.membershipPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        const skip = (page - 1) * limit;
        const [members, total] = await Promise.all([
            prisma_1.default.member.findMany({
                where: { currentPlanId: planId },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                            profileImage: true,
                            isActive: true,
                        },
                    },
                },
                orderBy: { joinDate: 'desc' },
            }),
            prisma_1.default.member.count({
                where: { currentPlanId: planId },
            }),
        ]);
        return {
            members,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }
    /**
     * Get plan statistics
     */
    static async getPlanStats() {
        const [totalPlans, activePlans, popularPlan, totalRevenue, plansByDuration,] = await Promise.all([
            prisma_1.default.membershipPlan.count(),
            prisma_1.default.membershipPlan.count({
                where: { isActive: true },
            }),
            prisma_1.default.membershipPlan.findFirst({
                where: { isPopular: true },
                include: {
                    _count: {
                        select: {
                            members: true,
                        },
                    },
                },
            }),
            prisma_1.default.payment.aggregate({
                where: {
                    status: client_1.PaymentStatus.PAID,
                    planId: { not: null },
                },
                _sum: {
                    finalAmount: true,
                },
            }),
            prisma_1.default.membershipPlan.groupBy({
                by: ['durationDays'],
                _count: true,
                orderBy: {
                    durationDays: 'asc',
                },
            }),
        ]);
        // Get most purchased plan
        const mostPurchasedPlan = await prisma_1.default.membershipPlan.findFirst({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        payments: true,
                    },
                },
            },
            orderBy: {
                payments: {
                    _count: 'desc',
                },
            },
        });
        // Get revenue by plan
        const revenueByPlan = await prisma_1.default.payment.groupBy({
            by: ['planId'],
            where: {
                status: client_1.PaymentStatus.PAID,
                planId: { not: null },
            },
            _sum: {
                finalAmount: true,
            },
            _count: true,
        });
        // Fetch plan details for revenue by plan
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
            totalPlans,
            activePlans,
            inactivePlans: totalPlans - activePlans,
            popularPlan: popularPlan
                ? {
                    id: popularPlan.id,
                    name: popularPlan.name,
                    memberCount: popularPlan._count.members,
                }
                : null,
            mostPurchasedPlan: mostPurchasedPlan
                ? {
                    id: mostPurchasedPlan.id,
                    name: mostPurchasedPlan.name,
                    purchaseCount: mostPurchasedPlan._count.payments,
                }
                : null,
            totalRevenue: totalRevenue._sum.finalAmount || 0,
            plansByDuration: plansByDuration.map((item) => ({
                durationDays: item.durationDays,
                count: item._count,
            })),
            revenueByPlan: revenueByPlanWithDetails,
        };
    }
    /**
     * Compare plans
     */
    static async comparePlans(planIds) {
        if (planIds.length < 2) {
            throw new ApiError_1.AppError('At least 2 plans required for comparison', http_status_1.default.BAD_REQUEST);
        }
        if (planIds.length > 4) {
            throw new ApiError_1.AppError('Maximum 4 plans can be compared at once', http_status_1.default.BAD_REQUEST);
        }
        const plans = await prisma_1.default.membershipPlan.findMany({
            where: {
                id: { in: planIds },
            },
            include: {
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });
        if (plans.length !== planIds.length) {
            throw new ApiError_1.AppError('One or more plans not found', http_status_1.default.NOT_FOUND);
        }
        return plans;
    }
    /**
     * Calculate plan savings
     */
    static async calculateSavings(planId) {
        const plan = await prisma_1.default.membershipPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new ApiError_1.AppError('Membership plan not found', http_status_1.default.NOT_FOUND);
        }
        const originalPrice = plan.price;
        const discountAmount = (originalPrice * plan.discount) / 100;
        const finalPrice = originalPrice - discountAmount;
        // Calculate monthly equivalent
        const monthlyEquivalent = (finalPrice / plan.durationDays) * 30;
        // Find similar duration plans for comparison
        const similarPlans = await prisma_1.default.membershipPlan.findMany({
            where: {
                durationDays: plan.durationDays,
                isActive: true,
                NOT: { id: planId },
            },
            select: {
                name: true,
                price: true,
                discount: true,
            },
        });
        return {
            planName: plan.name,
            originalPrice,
            discount: plan.discount,
            discountAmount,
            finalPrice,
            monthlyEquivalent: Math.round(monthlyEquivalent),
            durationDays: plan.durationDays,
            similarPlans: similarPlans.map((p) => ({
                name: p.name,
                price: p.price - (p.price * p.discount) / 100,
            })),
        };
    }
}
exports.PlanService = PlanService;
