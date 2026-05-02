"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
class ClassService {
    static async createClass(data, createdBy) {
        const { name, description, trainerId, classType, capacity, duration, imageUrl, isActive, } = data;
        // Verify trainer exists
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
            include: { user: true },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        if (!trainer.isAvailable) {
            throw new ApiError_1.AppError('Trainer is not available', http_status_1.default.BAD_REQUEST);
        }
        // Check if class name already exists for this trainer
        const existingClass = await prisma_1.default.class.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                trainerId,
            },
        });
        if (existingClass) {
            throw new ApiError_1.AppError('A class with this name already exists for this trainer', http_status_1.default.BAD_REQUEST);
        }
        const newClass = await prisma_1.default.$transaction(async (tx) => {
            const classData = await tx.class.create({
                data: {
                    name,
                    description,
                    trainerId,
                    classType,
                    capacity,
                    duration,
                    imageUrl,
                    isActive: isActive ?? true,
                },
                include: {
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
            });
            return classData;
        });
        return newClass;
    }
    static async getAllClasses(query) {
        const { page = '1', limit = '10', classType, trainerId, search, isActive, sortBy = 'createdAt', order = 'desc', } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {};
        if (classType) {
            where.classType = classType;
        }
        if (trainerId) {
            where.trainerId = trainerId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [classes, total] = await Promise.all([
            prisma_1.default.class.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                    schedules: {
                        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                    },
                    _count: {
                        select: { bookings: true },
                    },
                },
                orderBy: { [sortBy]: order },
            }),
            prisma_1.default.class.count({ where }),
        ]);
        return {
            classes,
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
    static async getActiveClasses() {
        return await prisma_1.default.class.findMany({
            where: { isActive: true },
            include: {
                trainer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                schedules: {
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
                _count: {
                    select: { bookings: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    static async getClassById(classId) {
        const classData = await prisma_1.default.class.findUnique({
            where: { id: classId },
            include: {
                trainer: {
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
                },
                schedules: {
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
                _count: {
                    select: { bookings: true },
                },
            },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        return classData;
    }
    static async updateClass(classId, data, userId, userRole, updatedBy) {
        const existingClass = await prisma_1.default.class.findUnique({
            where: { id: classId },
            include: { trainer: { include: { user: true } } },
        });
        if (!existingClass) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        // Check authorization for trainers
        if (userRole === client_1.Role.TRAINER) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { userId },
            });
            if (!trainer || trainer.id !== existingClass.trainerId) {
                throw new ApiError_1.AppError('You can only update your own classes', http_status_1.default.FORBIDDEN);
            }
        }
        // If trainer is being changed, verify new trainer
        if (data.trainerId && data.trainerId !== existingClass.trainerId) {
            const newTrainer = await prisma_1.default.trainer.findUnique({
                where: { id: data.trainerId },
            });
            if (!newTrainer) {
                throw new ApiError_1.AppError('New trainer not found', http_status_1.default.NOT_FOUND);
            }
            if (!newTrainer.isAvailable) {
                throw new ApiError_1.AppError('New trainer is not available', http_status_1.default.BAD_REQUEST);
            }
        }
        const updatedClass = await prisma_1.default.$transaction(async (tx) => {
            const updated = await tx.class.update({
                where: { id: classId },
                data: {
                    name: data.name,
                    description: data.description,
                    trainerId: data.trainerId,
                    classType: data.classType,
                    capacity: data.capacity,
                    duration: data.duration,
                    imageUrl: data.imageUrl,
                    isActive: data.isActive,
                },
                include: {
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                    schedules: true,
                },
            });
            return updated;
        });
        return updatedClass;
    }
    static async deleteClass(classId, deletedBy) {
        const existingClass = await prisma_1.default.class.findUnique({
            where: { id: classId },
            include: {
                _count: {
                    select: { bookings: true },
                },
            },
        });
        if (!existingClass) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        if (existingClass._count.bookings > 0) {
            throw new ApiError_1.AppError('Cannot delete class with existing bookings. Please cancel all bookings first.', http_status_1.default.BAD_REQUEST);
        }
        await prisma_1.default.$transaction(async (tx) => {
            // Delete schedules first
            await tx.classSchedule.deleteMany({
                where: { classId },
            });
            // Delete class
            await tx.class.delete({
                where: { id: classId },
            });
        });
        return { message: 'Class deleted successfully' };
    }
    static async toggleClassStatus(classId, updatedBy) {
        const existingClass = await prisma_1.default.class.findUnique({
            where: { id: classId },
        });
        if (!existingClass) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        const updatedClass = await prisma_1.default.$transaction(async (tx) => {
            const updated = await tx.class.update({
                where: { id: classId },
                data: { isActive: !existingClass.isActive },
                include: {
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                },
            });
            return updated;
        });
        return updatedClass;
    }
    static async getTrainerClasses(trainerId) {
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        const classes = await prisma_1.default.class.findMany({
            where: { trainerId },
            include: {
                schedules: {
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
                _count: {
                    select: { bookings: true },
                },
            },
            orderBy: { name: 'asc' },
        });
        return classes;
    }
    static async getClassStats() {
        const [totalClasses, activeClasses, totalBookings, classByType, topClasses,] = await Promise.all([
            prisma_1.default.class.count(),
            prisma_1.default.class.count({ where: { isActive: true } }),
            prisma_1.default.classBooking.count(),
            prisma_1.default.class.groupBy({
                by: ['classType'],
                _count: true,
                orderBy: { _count: { classType: 'desc' } },
            }),
            prisma_1.default.class.findMany({
                take: 5,
                include: {
                    trainer: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    profileImage: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: { bookings: true },
                    },
                },
                orderBy: {
                    bookings: { _count: 'desc' },
                },
            }),
        ]);
        return {
            totalClasses,
            activeClasses,
            inactiveClasses: totalClasses - activeClasses,
            totalBookings,
            classByType,
            topClasses,
        };
    }
    // SCHEDULE OPERATIONS
    static async getClassSchedules(classId) {
        const classData = await prisma_1.default.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        const schedules = await prisma_1.default.classSchedule.findMany({
            where: { classId },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
        return schedules;
    }
    static async createClassSchedule(classId, data, userId, userRole, createdBy) {
        const classData = await prisma_1.default.class.findUnique({
            where: { id: classId },
            include: { trainer: { include: { user: true } } },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        // Check authorization for trainers
        if (userRole === client_1.Role.TRAINER) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { userId },
            });
            if (!trainer || trainer.id !== classData.trainerId) {
                throw new ApiError_1.AppError('You can only create schedules for your own classes', http_status_1.default.FORBIDDEN);
            }
        }
        // Check for conflicting schedules
        const conflictingSchedule = await prisma_1.default.classSchedule.findFirst({
            where: {
                classId,
                dayOfWeek: data.dayOfWeek,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: data.startTime } },
                            { endTime: { gt: data.startTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: data.endTime } },
                            { endTime: { gte: data.endTime } },
                        ],
                    },
                ],
            },
        });
        if (conflictingSchedule) {
            throw new ApiError_1.AppError('Schedule conflicts with existing schedule', http_status_1.default.BAD_REQUEST);
        }
        const schedule = await prisma_1.default.$transaction(async (tx) => {
            const newSchedule = await tx.classSchedule.create({
                data: {
                    classId,
                    dayOfWeek: data.dayOfWeek,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    isRecurring: data.isRecurring ?? true,
                    specificDate: data.specificDate
                        ? new Date(data.specificDate)
                        : null,
                },
            });
            return newSchedule;
        });
        return schedule;
    }
    static async updateClassSchedule(classId, scheduleId, data, userId, userRole, updatedBy) {
        const classData = await prisma_1.default.class.findUnique({
            where: { id: classId },
            include: { trainer: { include: { user: true } } },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        const schedule = await prisma_1.default.classSchedule.findUnique({
            where: { id: scheduleId },
        });
        if (!schedule || schedule.classId !== classId) {
            throw new ApiError_1.AppError('Schedule not found', http_status_1.default.NOT_FOUND);
        }
        // Check authorization for trainers
        if (userRole === client_1.Role.TRAINER) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { userId },
            });
            if (!trainer || trainer.id !== classData.trainerId) {
                throw new ApiError_1.AppError('You can only update schedules for your own classes', http_status_1.default.FORBIDDEN);
            }
        }
        const updatedSchedule = await prisma_1.default.$transaction(async (tx) => {
            const updated = await tx.classSchedule.update({
                where: { id: scheduleId },
                data: {
                    dayOfWeek: data.dayOfWeek,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    isRecurring: data.isRecurring,
                    specificDate: data.specificDate
                        ? new Date(data.specificDate)
                        : undefined,
                },
            });
            return updated;
        });
        return updatedSchedule;
    }
    static async deleteClassSchedule(classId, scheduleId, userId, userRole, deletedBy) {
        const classData = await prisma_1.default.class.findUnique({
            where: { id: classId },
            include: { trainer: { include: { user: true } } },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        const schedule = await prisma_1.default.classSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                _count: {
                    select: { bookings: true },
                },
            },
        });
        if (!schedule || schedule.classId !== classId) {
            throw new ApiError_1.AppError('Schedule not found', http_status_1.default.NOT_FOUND);
        }
        // Check authorization for trainers
        if (userRole === client_1.Role.TRAINER) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { userId },
            });
            if (!trainer || trainer.id !== classData.trainerId) {
                throw new ApiError_1.AppError('You can only delete schedules for your own classes', http_status_1.default.FORBIDDEN);
            }
        }
        if (schedule._count.bookings > 0) {
            throw new ApiError_1.AppError('Cannot delete schedule with existing bookings', http_status_1.default.BAD_REQUEST);
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.classSchedule.delete({
                where: { id: scheduleId },
            });
        });
        return { message: 'Schedule deleted successfully' };
    }
}
exports.ClassService = ClassService;
