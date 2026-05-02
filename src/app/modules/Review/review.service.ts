// src/modules/review/review.service.ts

import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';
import { Role } from '@prisma/client';

interface IUser {
  id: string;
  role: Role;
  email: string;
}

interface ICreateReview {
  trainerId: string;
  rating: number;
  comment?: string | null;
  tags?: string[];
}

interface IUpdateReview {
  rating?: number;
  comment?: string | null;
  tags?: string[];
}

export class ReviewService {
  /**
   * Create trainer review
   */
  static async createReview(data: ICreateReview, user: IUser) {
    const { trainerId, rating, comment, tags } = data;

    // Only members can create reviews
    if (user.role !== Role.MEMBER) {
      throw new AppError('Only members can create reviews', httpStatus.FORBIDDEN);
    }

    // Get member profile
    const member = await prisma.member.findUnique({
      where: { userId: user.id },
    });

    if (!member) {
      throw new AppError('Member profile not found', httpStatus.NOT_FOUND);
    }

    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
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
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    if (!trainer.user.isActive) {
      throw new AppError('Trainer is not active', httpStatus.BAD_REQUEST);
    }

    // Check if member has already reviewed this trainer
    const existingReview = await prisma.trainerReview.findUnique({
      where: {
        trainerId_memberId: {
          trainerId,
          memberId: member.id,
        },
      },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this trainer', httpStatus.BAD_REQUEST);
    }

    // Check if member has been assigned to this trainer
    const hasBeenAssigned = await prisma.member.findFirst({
      where: {
        id: member.id,
        assignedTrainerId: trainerId,
      },
    });

    if (!hasBeenAssigned) {
      throw new AppError(
        'You can only review trainers you have been assigned to',
        httpStatus.BAD_REQUEST
      );
    }

    // Create review
    const review = await prisma.$transaction(async (tx) => {
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
  private static async updateTrainerRating(trainerId: string, tx?: any) {
    const prismaClient = tx || prisma;

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
  static async getTrainerReviews(trainerId: string, query: any) {
    const {
      page = '1',
      limit = '10',
      rating,
      isVerified,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { trainerId };

    if (rating !== undefined) {
      where.rating = rating;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    const [reviews, total] = await Promise.all([
      prisma.trainerReview.findMany({
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
      prisma.trainerReview.count({ where }),
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
  static async getReviewById(id: string, user: IUser) {
    const review = await prisma.trainerReview.findUnique({
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
      throw new AppError('Review not found', httpStatus.NOT_FOUND);
    }

    return review;
  }

  /**
   * Update review
   */
  static async updateReview(id: string, data: IUpdateReview, user: IUser) {
    const review = await prisma.trainerReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', httpStatus.NOT_FOUND);
    }

    // Only the review owner can update
    if (user.role === Role.MEMBER) {
      const member = await prisma.member.findUnique({
        where: { userId: user.id },
      });

      if (!member || member.id !== review.memberId) {
        throw new AppError('Access denied', httpStatus.FORBIDDEN);
      }
    } else if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new AppError('Access denied', httpStatus.FORBIDDEN);
    }

    const updated = await prisma.$transaction(async (tx) => {
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
  static async deleteReview(id: string, user: IUser) {
    const review = await prisma.trainerReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    if (user.role === Role.MEMBER) {
      const member = await prisma.member.findUnique({
        where: { userId: user.id },
      });

      if (!member || member.id !== review.memberId) {
        throw new AppError('Access denied', httpStatus.FORBIDDEN);
      }
    } else if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new AppError('Access denied', httpStatus.FORBIDDEN);
    }

    await prisma.$transaction(async (tx) => {
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
  static async getMemberReviews(memberId: string, query: any, user: IUser) {
    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new AppError('Member not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    if (user.role === Role.MEMBER) {
      const userMember = await prisma.member.findUnique({
        where: { userId: user.id },
      });

      if (!userMember || userMember.id !== memberId) {
        throw new AppError('Access denied', httpStatus.FORBIDDEN);
      }
    }

    const { page = '1', limit = '10' } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.trainerReview.findMany({
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
      prisma.trainerReview.count({ where: { memberId } }),
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
  static async verifyReview(id: string, isVerified: boolean, user: IUser) {
    const review = await prisma.trainerReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', httpStatus.NOT_FOUND);
    }

    const updated = await prisma.trainerReview.update({
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
  static async getAllReviews(query: any) {
    const {
      page = '1',
      limit = '10',
      trainerId,
      memberId,
      rating,
      isVerified,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (trainerId) where.trainerId = trainerId;
    if (memberId) where.memberId = memberId;
    if (rating !== undefined) where.rating = rating;
    if (isVerified !== undefined) where.isVerified = isVerified;

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { member: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { trainer: { user: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.trainerReview.findMany({
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
      prisma.trainerReview.count({ where }),
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
  static async getTrainerRatingSummary(trainerId: string) {
    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
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
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Get rating distribution
    const ratingDistribution = await prisma.trainerReview.groupBy({
      by: ['rating'],
      where: { trainerId },
      _count: { rating: true },
    });

    // Convert to object for easy access
    const distribution: any = {
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
    const aggregation = await prisma.trainerReview.aggregate({
      where: { trainerId },
      _avg: { rating: true },
      _count: { id: true },
    });

    // Get verified reviews count
    const verifiedCount = await prisma.trainerReview.count({
      where: {
        trainerId,
        isVerified: true,
      },
    });

    // Get most common tags
    const allReviews = await prisma.trainerReview.findMany({
      where: { trainerId },
      select: { tags: true },
    });

    const tagCounts: { [key: string]: number } = {};
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