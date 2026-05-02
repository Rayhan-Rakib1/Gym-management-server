"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = require("../../errors/ApiError");
const idGenerator_1 = require("../../../utils/idGenerator");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
class TrainerService {
    /**
     * Get all trainers with filters and pagination
     */
    static async getAllTrainers(query) {
        const { page = '1', limit = '10', search, specialization, isAvailable, minRating, sortBy = 'createdAt', order = 'desc', } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {};
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
        const total = await prisma_1.default.trainer.count({ where });
        // Get trainers
        const trainers = await prisma_1.default.trainer.findMany({
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
    static async getTrainerById(trainerId) {
        const trainer = await prisma_1.default.trainer.findUnique({
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
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        return trainer;
    }
    /**
     * Create new trainer
     */
    static async createTrainer(data, createdBy) {
        const { name, email, password, phone, experienceYears, certifications = [], bio, languages = ['Bangla', 'English'], salary, maxCapacity = 20, specializations = [], } = data;
        // Check if email already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new ApiError_1.AppError('Email already registered', http_status_1.default.BAD_REQUEST);
        }
        // Check if phone already exists
        if (phone) {
            const existingPhone = await prisma_1.default.user.findFirst({
                where: { phone },
            });
            if (existingPhone) {
                throw new ApiError_1.AppError('Phone number already registered', http_status_1.default.BAD_REQUEST);
            }
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Generate employee ID
        const employeeId = await (0, idGenerator_1.generateEmployeeId)();
        // Create trainer with transaction
        const trainer = await prisma_1.default.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    role: client_1.Role.TRAINER,
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
    static async updateTrainer(trainerId, data, updatedBy) {
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
            include: { user: true },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Check if phone is already taken
        if (data.phone) {
            const existingPhone = await prisma_1.default.user.findFirst({
                where: {
                    phone: data.phone,
                    NOT: { id: trainer.userId },
                },
            });
            if (existingPhone) {
                throw new ApiError_1.AppError('Phone number already in use', http_status_1.default.BAD_REQUEST);
            }
        }
        // Update with transaction
        const updatedTrainer = await prisma_1.default.$transaction(async (tx) => {
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
    static async addSpecialization(trainerId, data) {
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Check if specialization already exists
        const existing = await prisma_1.default.trainerSpecialization.findUnique({
            where: {
                trainerId_specialization: {
                    trainerId,
                    specialization: data.specialization,
                },
            },
        });
        if (existing) {
            throw new ApiError_1.AppError('Specialization already exists', http_status_1.default.BAD_REQUEST);
        }
        const specialization = await prisma_1.default.trainerSpecialization.create({
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
    static async updateSpecialization(specializationId, data) {
        const specialization = await prisma_1.default.trainerSpecialization.findUnique({
            where: { id: specializationId },
        });
        if (!specialization) {
            throw new ApiError_1.AppError('Specialization not found', http_status_1.default.NOT_FOUND);
        }
        const updated = await prisma_1.default.trainerSpecialization.update({
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
    static async deleteSpecialization(specializationId) {
        const specialization = await prisma_1.default.trainerSpecialization.findUnique({
            where: { id: specializationId },
        });
        if (!specialization) {
            throw new ApiError_1.AppError('Specialization not found', http_status_1.default.NOT_FOUND);
        }
        await prisma_1.default.trainerSpecialization.delete({
            where: { id: specializationId },
        });
        return { message: 'Specialization removed successfully' };
    }
    /**
     * Set availability
     */
    static async setAvailability(trainerId, data) {
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Validate time
        if (data.startTime >= data.endTime) {
            throw new ApiError_1.AppError('End time must be after start time', http_status_1.default.BAD_REQUEST);
        }
        // Check if availability already exists
        const existing = await prisma_1.default.trainerAvailability.findUnique({
            where: {
                trainerId_dayOfWeek_startTime: {
                    trainerId,
                    dayOfWeek: data.dayOfWeek,
                    startTime: data.startTime,
                },
            },
        });
        if (existing) {
            throw new ApiError_1.AppError('Availability slot already exists', http_status_1.default.BAD_REQUEST);
        }
        const availability = await prisma_1.default.trainerAvailability.create({
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
    static async updateAvailability(availabilityId, data) {
        const availability = await prisma_1.default.trainerAvailability.findUnique({
            where: { id: availabilityId },
        });
        if (!availability) {
            throw new ApiError_1.AppError('Availability not found', http_status_1.default.NOT_FOUND);
        }
        // Validate time if both are provided
        const startTime = data.startTime || availability.startTime;
        const endTime = data.endTime || availability.endTime;
        if (startTime >= endTime) {
            throw new ApiError_1.AppError('End time must be after start time', http_status_1.default.BAD_REQUEST);
        }
        const updated = await prisma_1.default.trainerAvailability.update({
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
    static async deleteAvailability(availabilityId) {
        const availability = await prisma_1.default.trainerAvailability.findUnique({
            where: { id: availabilityId },
        });
        if (!availability) {
            throw new ApiError_1.AppError('Availability not found', http_status_1.default.NOT_FOUND);
        }
        await prisma_1.default.trainerAvailability.delete({
            where: { id: availabilityId },
        });
        return { message: 'Availability removed successfully' };
    }
    /**
     * Delete trainer
     */
    static async deleteTrainer(trainerId, deletedBy) {
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
            include: { user: true },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Check if trainer has active members
        if (trainer.currentClients > 0) {
            throw new ApiError_1.AppError('Cannot delete trainer with active members. Please reassign members first.', 400);
        }
        await prisma_1.default.$transaction(async (tx) => {
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
    static async getTrainerDashboard(trainerId) {
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
                specializations: true,
            },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Get statistics
        const [totalMembers, activeMembers, totalClasses, upcomingClasses, totalWorkoutPlans, averageRating, thisMonthReviews,] = await Promise.all([
            prisma_1.default.member.count({
                where: { assignedTrainerId: trainerId },
            }),
            prisma_1.default.member.count({
                where: {
                    assignedTrainerId: trainerId,
                    user: { isActive: true },
                },
            }),
            prisma_1.default.class.count({
                where: { trainerId },
            }),
            prisma_1.default.class.count({
                where: {
                    trainerId,
                    isActive: true,
                },
            }),
            prisma_1.default.workoutPlan.count({
                where: { trainerId },
            }),
            prisma_1.default.trainerReview.aggregate({
                where: { trainerId },
                _avg: { rating: true },
            }),
            prisma_1.default.trainerReview.count({
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
    static async getTrainerMembers(trainerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [members, total] = await Promise.all([
            prisma_1.default.member.findMany({
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
            prisma_1.default.member.count({
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
    static async getTrainerReviews(trainerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [reviews, total, stats] = await Promise.all([
            prisma_1.default.trainerReview.findMany({
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
            prisma_1.default.trainerReview.count({
                where: { trainerId },
            }),
            prisma_1.default.trainerReview.groupBy({
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
            ratingDistribution[stat.rating] = stat._count;
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
    static async getTrainerPerformance(trainerId) {
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Get monthly statistics for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const [memberGrowth, reviewsOverTime, classAttendance,] = await Promise.all([
            prisma_1.default.member.groupBy({
                by: ['trainerAssignedDate'],
                where: {
                    assignedTrainerId: trainerId,
                    trainerAssignedDate: {
                        gte: sixMonthsAgo,
                    },
                },
                _count: true,
            }),
            prisma_1.default.trainerReview.groupBy({
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
            prisma_1.default.classBooking.count({
                where: {
                    class: { trainerId },
                    status: client_1.BookingStatus.COMPLETED,
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
        const [totalTrainers, activeTrainers, availableTrainers, topRatedTrainers,] = await Promise.all([
            prisma_1.default.trainer.count(),
            prisma_1.default.trainer.count({
                where: {
                    user: { isActive: true },
                },
            }),
            prisma_1.default.trainer.count({
                where: {
                    isAvailable: true,
                    user: { isActive: true },
                },
            }),
            prisma_1.default.trainer.findMany({
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
        const trainersBySpecialization = await prisma_1.default.trainerSpecialization.groupBy({
            by: ['specialization'],
            _count: true,
        });
        // Get average capacity usage
        const capacityStats = await prisma_1.default.trainer.aggregate({
            _avg: {
                currentClients: true,
                maxCapacity: true,
            },
        });
        const avgCapacityUsage = capacityStats._avg.currentClients && capacityStats._avg.maxCapacity
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
    static async searchTrainers(filters) {
        const where = {
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
        const trainers = await prisma_1.default.trainer.findMany({
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
exports.TrainerService = TrainerService;
