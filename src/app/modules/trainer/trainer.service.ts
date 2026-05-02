import httpStatus from 'http-status';
import { BookingStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../../errors/ApiError';
import { generateEmployeeId } from '../../../utils/idGenerator';
import prisma from '../../../shared/prisma';


export class TrainerService {
  /**
   * Get all trainers with filters and pagination
   */
  static async getAllTrainers(query: any) {
    const {
      page = '1',
      limit = '10',
      search,
      specialization,
      isAvailable,
      minRating,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (specialization) {
      where.specializations = {
        some: {
          specialization: specialization,
        },
      };
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    if (minRating) {
      where.rating = {
        gte: minRating,
      };
    }

    // Get total count
    const total = await prisma.trainer.count({ where });

    // Get trainers
    const trainers = await prisma.trainer.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: order,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            isActive: true,
            createdAt: true,
          },
        },
        specializations: true,
        availability: true,
        _count: {
          select: {
            members: true,
            classes: true,
            reviews: true,
          },
        },
      },
    });

    return {
      trainers,
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
   * Get trainer by ID
   */
  static async getTrainerById(trainerId: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            isActive: true,
            createdAt: true,
          },
        },
        specializations: true,
        availability: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profileImage: true,
              },
            },
            currentPlan: true,
          },
        },
        classes: {
          where: {
            isActive: true,
          },
          include: {
            schedules: true,
          },
        },
        reviews: {
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
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            classes: true,
            reviews: true,
            workoutPlans: true,
          },
        },
      },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    return trainer;
  }

  /**
   * Create new trainer
   */
  static async createTrainer(data: any, createdBy: string) {
    const {
      name,
      email,
      password,
      phone,
      experienceYears,
      certifications = [],
      bio,
      languages = ['Bangla', 'English'],
      salary,
      maxCapacity = 20,
      specializations = [],
    } = data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', httpStatus.BAD_REQUEST);
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone },
      });

      if (existingPhone) {
        throw new AppError('Phone number already registered', httpStatus.BAD_REQUEST);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate employee ID
    const employeeId = await generateEmployeeId();

    // Create trainer with transaction
    const trainer = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: Role.TRAINER,
          isActive: true,
          isVerified: true,
        },
      });

      // Create trainer profile
      const newTrainer = await tx.trainer.create({
        data: {
          userId: user.id,
          employeeId,
          experienceYears,
          certifications,
          bio,
          languages,
          salary,
          maxCapacity,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
        },
      });

      // Add specializations
      if (specializations.length > 0) {
        await tx.trainerSpecialization.createMany({
          data: specializations.map((spec) => ({
            trainerId: newTrainer.id,
            specialization: spec.specialization,
            proficiencyLevel: spec.proficiencyLevel || 5,
            yearsOfExperience: spec.yearsOfExperience || 0,
          })),
        });
      }

      return newTrainer;
    });

    return trainer;
  }

  /**
   * Update trainer
   */
  static async updateTrainer(
    trainerId: string,
    data: any,
    updatedBy: string
  ) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Check if phone is already taken
    if (data.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: data.phone,
          NOT: { id: trainer.userId },
        },
      });

      if (existingPhone) {
        throw new AppError('Phone number already in use', httpStatus.BAD_REQUEST);
      }
    }

    // Update with transaction
    const updatedTrainer = await prisma.$transaction(async (tx) => {
      // Update user
      if (data.name || data.phone) {
        await tx.user.update({
          where: { id: trainer.userId },
          data: {
            name: data.name,
            phone: data.phone,
          },
        });
      }

      // Update trainer
      const updated = await tx.trainer.update({
        where: { id: trainerId },
        data: {
          experienceYears: data.experienceYears,
          certifications: data.certifications,
          bio: data.bio,
          languages: data.languages,
          salary: data.salary,
          maxCapacity: data.maxCapacity,
          isAvailable: data.isAvailable,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          specializations: true,
        },
      });

      return updated;
    });

    return updatedTrainer;
  }

  /**
   * Add specialization
   */
  static async addSpecialization(
    trainerId: string,
    data: any
  ) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Check if specialization already exists
    const existing = await prisma.trainerSpecialization.findUnique({
      where: {
        trainerId_specialization: {
          trainerId,
          specialization: data.specialization,
        },
      },
    });

    if (existing) {
      throw new AppError('Specialization already exists', httpStatus.BAD_REQUEST);
    }

    const specialization = await prisma.trainerSpecialization.create({
      data: {
        trainerId,
        specialization: data.specialization,
        proficiencyLevel: data.proficiencyLevel,
        yearsOfExperience: data.yearsOfExperience,
      },
    });

    return specialization;
  }

  /**
   * Update specialization
   */
  static async updateSpecialization(
    specializationId: string,
    data: any
  ) {
    const specialization = await prisma.trainerSpecialization.findUnique({
      where: { id: specializationId },
    });

    if (!specialization) {
      throw new AppError('Specialization not found', httpStatus.NOT_FOUND);
    }

    const updated = await prisma.trainerSpecialization.update({
      where: { id: specializationId },
      data: {
        proficiencyLevel: data.proficiencyLevel,
        yearsOfExperience: data.yearsOfExperience,
      },
    });

    return updated;
  }

  /**
   * Delete specialization
   */
  static async deleteSpecialization(specializationId: string) {
    const specialization = await prisma.trainerSpecialization.findUnique({
      where: { id: specializationId },
    });

    if (!specialization) {
      throw new AppError('Specialization not found', httpStatus.NOT_FOUND);
    }

    await prisma.trainerSpecialization.delete({
      where: { id: specializationId },
    });

    return { message: 'Specialization removed successfully' };
  }

  /**
   * Set availability
   */
  static async setAvailability(trainerId: string, data: any) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Validate time
    if (data.startTime >= data.endTime) {
      throw new AppError('End time must be after start time', httpStatus.BAD_REQUEST);
    }

    // Check if availability already exists
    const existing = await prisma.trainerAvailability.findUnique({
      where: {
        trainerId_dayOfWeek_startTime: {
          trainerId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
        },
      },
    });

    if (existing) {
      throw new AppError('Availability slot already exists', httpStatus.BAD_REQUEST);
    }

    const availability = await prisma.trainerAvailability.create({
      data: {
        trainerId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable,
      },
    });

    return availability;
  }

  /**
   * Update availability
   */
  static async updateAvailability(
    availabilityId: string,
    data: any
  ) {
    const availability = await prisma.trainerAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new AppError('Availability not found', httpStatus.NOT_FOUND);
    }

    // Validate time if both are provided
    const startTime = data.startTime || availability.startTime;
    const endTime = data.endTime || availability.endTime;

    if (startTime >= endTime) {
      throw new AppError('End time must be after start time', httpStatus.BAD_REQUEST);
    }

    const updated = await prisma.trainerAvailability.update({
      where: { id: availabilityId },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable,
      },
    });

    return updated;
  }

  /**
   * Delete availability
   */
  static async deleteAvailability(availabilityId: string) {
    const availability = await prisma.trainerAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new AppError('Availability not found', httpStatus.NOT_FOUND);
    }

    await prisma.trainerAvailability.delete({
      where: { id: availabilityId },
    });

    return { message: 'Availability removed successfully' };
  }

  /**
   * Delete trainer
   */
  static async deleteTrainer(trainerId: string, deletedBy: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Check if trainer has active members
    if (trainer.currentClients > 0) {
      throw new AppError(
        'Cannot delete trainer with active members. Please reassign members first.',
        400
      );
    }

    await prisma.$transaction(async (tx) => {
      // Deactivate user (soft delete)
      await tx.user.update({
        where: { id: trainer.userId },
        data: { isActive: false },
      });

    });

    return { message: 'Trainer deleted successfully' };
  }

  /**
   * Get trainer dashboard
   */
  static async getTrainerDashboard(trainerId: string) {
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
        specializations: true,
      },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Get statistics
    const [
      totalMembers,
      activeMembers,
      totalClasses,
      upcomingClasses,
      totalWorkoutPlans,
      averageRating,
      thisMonthReviews,
    ] = await Promise.all([
      prisma.member.count({
        where: { assignedTrainerId: trainerId },
      }),
      prisma.member.count({
        where: {
          assignedTrainerId: trainerId,
          user: { isActive: true },
        },
      }),
      prisma.class.count({
        where: { trainerId },
      }),
      prisma.class.count({
        where: {
          trainerId,
          isActive: true,
        },
      }),
      prisma.workoutPlan.count({
        where: { trainerId },
      }),
      prisma.trainerReview.aggregate({
        where: { trainerId },
        _avg: { rating: true },
      }),
      prisma.trainerReview.count({
        where: {
          trainerId,
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),
    ]);

    return {
      trainer,
      stats: {
        totalMembers,
        activeMembers,
        totalClasses,
        upcomingClasses,
        totalWorkoutPlans,
        averageRating: averageRating._avg.rating || 0,
        thisMonthReviews,
        capacityUsage: (trainer.currentClients / trainer.maxCapacity) * 100,
      },
    };
  }

  /**
   * Get trainer members
   */
  static async getTrainerMembers(trainerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: { assignedTrainerId: trainerId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          currentPlan: true,
        },
        orderBy: { trainerAssignedDate: 'desc' },
      }),
      prisma.member.count({
        where: { assignedTrainerId: trainerId },
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
   * Get trainer reviews
   */
  static async getTrainerReviews(trainerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      prisma.trainerReview.findMany({
        where: { trainerId },
        skip,
        take: limit,
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trainerReview.count({
        where: { trainerId },
      }),
      prisma.trainerReview.groupBy({
        by: ['rating'],
        where: { trainerId },
        _count: true,
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((stat) => {
      ratingDistribution[stat.rating as keyof typeof ratingDistribution] = stat._count;
    });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      ratingDistribution,
    };
  }

  /**
   * Get trainer performance
   */
  static async getTrainerPerformance(trainerId: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Get monthly statistics for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      memberGrowth,
      reviewsOverTime,
      classAttendance,
    ] = await Promise.all([
      prisma.member.groupBy({
        by: ['trainerAssignedDate'],
        where: {
          assignedTrainerId: trainerId,
          trainerAssignedDate: {
            gte: sixMonthsAgo,
          },
        },
        _count: true,
      }),
      prisma.trainerReview.groupBy({
        by: ['createdAt'],
        where: {
          trainerId,
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.classBooking.count({
        where: {
          class: { trainerId },
          status: BookingStatus.COMPLETED,
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
      }),
    ]);

    return {
      memberGrowth,
      reviewsOverTime,
      classAttendance,
      currentStats: {
        successRate: trainer.successRate,
        totalClients: trainer.totalClients,
        currentClients: trainer.currentClients,
        rating: trainer.rating,
        reviewCount: trainer.reviewCount,
      },
    };
  }

  /**
   * Get trainer statistics
   */
  static async getTrainerStats() {
    const [
      totalTrainers,
      activeTrainers,
      availableTrainers,
      topRatedTrainers,
    ] = await Promise.all([
      prisma.trainer.count(),
      prisma.trainer.count({
        where: {
          user: { isActive: true },
        },
      }),
      prisma.trainer.count({
        where: {
          isAvailable: true,
          user: { isActive: true },
        },
      }),
      prisma.trainer.findMany({
        where: {
          user: { isActive: true },
          rating: { gte: 4.5 },
        },
        take: 5,
        orderBy: { rating: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
        },
      }),
    ]);

    // Get trainers by specialization
    const trainersBySpecialization = await prisma.trainerSpecialization.groupBy({
      by: ['specialization'],
      _count: true,
    });

    // Get average capacity usage
    const capacityStats = await prisma.trainer.aggregate({
      _avg: {
        currentClients: true,
        maxCapacity: true,
      },
    });

    const avgCapacityUsage =
      capacityStats._avg.currentClients && capacityStats._avg.maxCapacity
        ? (capacityStats._avg.currentClients / capacityStats._avg.maxCapacity) * 100
        : 0;

    return {
      totalTrainers,
      activeTrainers,
      inactiveTrainers: totalTrainers - activeTrainers,
      availableTrainers,
      unavailableTrainers: activeTrainers - availableTrainers,
      topRatedTrainers,
      trainersBySpecialization: trainersBySpecialization.map((item) => ({
        specialization: item.specialization,
        count: item._count,
      })),
      avgCapacityUsage: Math.round(avgCapacityUsage),
    };
  }

  /**
   * Search trainers by specialization and availability
   */
  static async searchTrainers(filters: {
    specializations?: string[];
    minRating?: number;
    isAvailable?: boolean;
    dayOfWeek?: string;
    timeSlot?: string;
  }) {
    const where: any = {
      user: { isActive: true },
    };

    if (filters.specializations && filters.specializations.length > 0) {
      where.specializations = {
        some: {
          specialization: {
            in: filters.specializations,
          },
        },
      };
    }

    if (filters.minRating) {
      where.rating = { gte: filters.minRating };
    }

    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    if (filters.dayOfWeek) {
      where.availability = {
        some: {
          dayOfWeek: filters.dayOfWeek,
          isAvailable: true,
        },
      };
    }

    const trainers = await prisma.trainer.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profileImage: true,
          },
        },
        specializations: true,
        availability: true,
        _count: {
          select: {
            members: true,
            reviews: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    return trainers;
  }
}