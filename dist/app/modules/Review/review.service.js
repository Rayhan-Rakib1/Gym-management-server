"use strict";
// src/modules/review/review.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const client_1 = require("@prisma/client");
class ReviewService {
    /**
     * Create trainer review
     */
    static async createReview(data, user) {
        const { trainerId, rating, comment, tags } = data;
        // Only members can create reviews
        if (user.role !== client_1.Role.MEMBER) {
            throw new ApiError_1.AppError('Only members can create reviews', http_status_1.default.FORBIDDEN);
        }
        // Get member profile
        const member = await prisma_1.default.member.findUnique({
            where: { userId: user.id },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member profile not found', http_status_1.default.NOT_FOUND);
        }
        // Verify trainer exists
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
            include: {
                user: {
                    select: {
                        name: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        if (!trainer.user.isActive) {
            throw new ApiError_1.AppError('Trainer is not active', http_status_1.default.BAD_REQUEST);
        }
        // Check if member has already reviewed this trainer
        const existingReview = await prisma_1.default.trainerReview.findUnique({
            where: {
                trainerId_memberId: {
                    trainerId,
                    memberId: member.id,
                },
            },
        });
        if (existingReview) {
            throw new ApiError_1.AppError('You have already reviewed this trainer', http_status_1.default.BAD_REQUEST);
        }
        // Check if member has been assigned to this trainer
        const hasBeenAssigned = await prisma_1.default.member.findFirst({
            where: {
                id: member.id,
                assignedTrainerId: trainerId,
            },
        });
        if (!hasBeenAssigned) {
            throw new ApiError_1.AppError('You can only review trainers you have been assigned to', http_status_1.default.BAD_REQUEST);
        }
        // Create review
        const review = await prisma_1.default.$transaction(async (tx) => {
            const newReview = await tx.trainerReview.create({
                data: {
                    trainerId,
                    memberId: member.id,
                    rating,
                    comment,
                    tags: tags || [],
                    isVerified: false,
                },
                include: {
                    member: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
            });
            // Update trainer's rating and review count
            await this.updateTrainerRating(trainerId, tx);
            return newReview;
        });
        return review;
    }
    /**
     * Update trainer rating statistics
     */
    static async updateTrainerRating(trainerId, tx) {
        const prismaClient = tx || prisma_1.default;
        const aggregation = await prismaClient.trainerReview.aggregate({
            where: { trainerId },
            _avg: { rating: true },
            _count: { id: true },
        });
        await prismaClient.trainer.update({
            where: { id: trainerId },
            data: {
                rating: aggregation._avg.rating || 0,
                reviewCount: aggregation._count.id || 0,
            },
        });
    }
    /**
     * Get trainer reviews
     */
    static async getTrainerReviews(trainerId, query) {
        const { page = '1', limit = '10', rating, isVerified, sortBy = 'createdAt', order = 'desc', } = query;
        // Verify trainer exists
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { trainerId };
        if (rating !== undefined) {
            where.rating = rating;
        }
        if (isVerified !== undefined) {
            where.isVerified = isVerified;
        }
        const [reviews, total] = await Promise.all([
            prisma_1.default.trainerReview.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    member: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { [sortBy]: order },
            }),
            prisma_1.default.trainerReview.count({ where }),
        ]);
        return {
            reviews,
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
     * Get review by ID
     */
    static async getReviewById(id, user) {
        const review = await prisma_1.default.trainerReview.findUnique({
            where: { id },
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                trainer: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                profileImage: true,
                            },
                        },
                    },
                },
            },
        });
        if (!review) {
            throw new ApiError_1.AppError('Review not found', http_status_1.default.NOT_FOUND);
        }
        return review;
    }
    /**
     * Update review
     */
    static async updateReview(id, data, user) {
        const review = await prisma_1.default.trainerReview.findUnique({
            where: { id },
        });
        if (!review) {
            throw new ApiError_1.AppError('Review not found', http_status_1.default.NOT_FOUND);
        }
        // Only the review owner can update
        if (user.role === client_1.Role.MEMBER) {
            const member = await prisma_1.default.member.findUnique({
                where: { userId: user.id },
            });
            if (!member || member.id !== review.memberId) {
                throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
            }
        }
        else if (user.role !== client_1.Role.ADMIN && user.role !== client_1.Role.SUPER_ADMIN) {
            throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
        }
        const updated = await prisma_1.default.$transaction(async (tx) => {
            const updatedReview = await tx.trainerReview.update({
                where: { id },
                data: {
                    ...(data.rating !== undefined && { rating: data.rating }),
                    ...(data.comment !== undefined && { comment: data.comment }),
                    ...(data.tags !== undefined && { tags: data.tags }),
                },
                include: {
                    member: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
            });
            // Update trainer rating if rating changed
            if (data.rating !== undefined) {
                await this.updateTrainerRating(review.trainerId, tx);
            }
            return updatedReview;
        });
        return updated;
    }
    /**
     * Delete review
     */
    static async deleteReview(id, user) {
        const review = await prisma_1.default.trainerReview.findUnique({
            where: { id },
        });
        if (!review) {
            throw new ApiError_1.AppError('Review not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        if (user.role === client_1.Role.MEMBER) {
            const member = await prisma_1.default.member.findUnique({
                where: { userId: user.id },
            });
            if (!member || member.id !== review.memberId) {
                throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
            }
        }
        else if (user.role !== client_1.Role.ADMIN && user.role !== client_1.Role.SUPER_ADMIN) {
            throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.trainerReview.delete({
                where: { id },
            });
            // Update trainer rating
            await this.updateTrainerRating(review.trainerId, tx);
        });
        return { message: 'Review deleted successfully' };
    }
    /**
     * Get member's reviews
     */
    static async getMemberReviews(memberId, query, user) {
        // Verify member exists
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        if (user.role === client_1.Role.MEMBER) {
            const userMember = await prisma_1.default.member.findUnique({
                where: { userId: user.id },
            });
            if (!userMember || userMember.id !== memberId) {
                throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
            }
        }
        const { page = '1', limit = '10' } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [reviews, total] = await Promise.all([
            prisma_1.default.trainerReview.findMany({
                where: { memberId },
                skip,
                take: limitNum,
                include: {
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.trainerReview.count({ where: { memberId } }),
        ]);
        return {
            reviews,
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
     * Verify review (Admin only)
     */
    static async verifyReview(id, isVerified, user) {
        const review = await prisma_1.default.trainerReview.findUnique({
            where: { id },
        });
        if (!review) {
            throw new ApiError_1.AppError('Review not found', http_status_1.default.NOT_FOUND);
        }
        const updated = await prisma_1.default.trainerReview.update({
            where: { id },
            data: { isVerified },
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                trainer: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                profileImage: true,
                            },
                        },
                    },
                },
            },
        });
        return updated;
    }
    /**
     * Get all reviews (Admin only)
     */
    static async getAllReviews(query) {
        const { page = '1', limit = '10', trainerId, memberId, rating, isVerified, search, sortBy = 'createdAt', order = 'desc', } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (trainerId)
            where.trainerId = trainerId;
        if (memberId)
            where.memberId = memberId;
        if (rating !== undefined)
            where.rating = rating;
        if (isVerified !== undefined)
            where.isVerified = isVerified;
        if (search) {
            where.OR = [
                { comment: { contains: search, mode: 'insensitive' } },
                { member: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { trainer: { user: { name: { contains: search, mode: 'insensitive' } } } },
            ];
        }
        const [reviews, total] = await Promise.all([
            prisma_1.default.trainerReview.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    member: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { [sortBy]: order },
            }),
            prisma_1.default.trainerReview.count({ where }),
        ]);
        return {
            reviews,
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
     * Get trainer rating summary
     */
    static async getTrainerRatingSummary(trainerId) {
        // Verify trainer exists
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        profileImage: true,
                    },
                },
            },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Get rating distribution
        const ratingDistribution = await prisma_1.default.trainerReview.groupBy({
            by: ['rating'],
            where: { trainerId },
            _count: { rating: true },
        });
        // Convert to object for easy access
        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
        ratingDistribution.forEach((item) => {
            distribution[item.rating] = item._count.rating;
        });
        // Get total reviews and average
        const aggregation = await prisma_1.default.trainerReview.aggregate({
            where: { trainerId },
            _avg: { rating: true },
            _count: { id: true },
        });
        // Get verified reviews count
        const verifiedCount = await prisma_1.default.trainerReview.count({
            where: {
                trainerId,
                isVerified: true,
            },
        });
        // Get most common tags
        const allReviews = await prisma_1.default.trainerReview.findMany({
            where: { trainerId },
            select: { tags: true },
        });
        const tagCounts = {};
        allReviews.forEach((review) => {
            review.tags.forEach((tag) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
        return {
            trainer: {
                id: trainer.id,
                name: trainer.user.name,
                profileImage: trainer.user.profileImage,
            },
            summary: {
                averageRating: aggregation._avg.rating || 0,
                totalReviews: aggregation._count.id || 0,
                verifiedReviews: verifiedCount,
                ratingDistribution: distribution,
            },
            topTags,
        };
    }
}
exports.ReviewService = ReviewService;
