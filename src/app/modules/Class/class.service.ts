
import httpStatus from 'http-status';
import { ClassType, DayOfWeek, Role } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';

export class ClassService {

  static async createClass(data: any, createdBy: string) {
    const {
      name,
      description,
      trainerId,
      classType,
      capacity,
      duration,
      imageUrl,
      isActive,
    } = data;

    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    if (!trainer.isAvailable) {
      throw new AppError('Trainer is not available', httpStatus.BAD_REQUEST);
    }

    // Check if class name already exists for this trainer
    const existingClass = await prisma.class.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        trainerId,
      },
    });

    if (existingClass) {
      throw new AppError(
        'A class with this name already exists for this trainer',
        httpStatus.BAD_REQUEST
      );
    }

    const newClass = await prisma.$transaction(async (tx) => {
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

  static async getAllClasses(query: any) {
    const {
      page = '1',
      limit = '10',
      classType,
      trainerId,
      search,
      isActive,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

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
      prisma.class.findMany({
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
      prisma.class.count({ where }),
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
    return await prisma.class.findMany({
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

  static async getClassById(classId: string) {
    const classData = await prisma.class.findUnique({
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
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    return classData;
  }

  static async updateClass(
    classId: string,
    data: any,
    userId: string,
    userRole: string,
    updatedBy: string
  ) {
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: { trainer: { include: { user: true } } },
    });

    if (!existingClass) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    // Check authorization for trainers
    if (userRole === Role.TRAINER) {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || trainer.id !== existingClass.trainerId) {
        throw new AppError(
          'You can only update your own classes',
          httpStatus.FORBIDDEN
        );
      }
    }

    // If trainer is being changed, verify new trainer
    if (data.trainerId && data.trainerId !== existingClass.trainerId) {
      const newTrainer = await prisma.trainer.findUnique({
        where: { id: data.trainerId },
      });

      if (!newTrainer) {
        throw new AppError('New trainer not found', httpStatus.NOT_FOUND);
      }

      if (!newTrainer.isAvailable) {
        throw new AppError(
          'New trainer is not available',
          httpStatus.BAD_REQUEST
        );
      }
    }

    const updatedClass = await prisma.$transaction(async (tx) => {
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

  static async deleteClass(classId: string, deletedBy: string) {
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existingClass) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    if (existingClass._count.bookings > 0) {
      throw new AppError(
        'Cannot delete class with existing bookings. Please cancel all bookings first.',
        httpStatus.BAD_REQUEST
      );
    }

    await prisma.$transaction(async (tx) => {
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

  static async toggleClassStatus(classId: string, updatedBy: string) {
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    const updatedClass = await prisma.$transaction(async (tx) => {
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

  static async getTrainerClasses(trainerId: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    const classes = await prisma.class.findMany({
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
    const [
      totalClasses,
      activeClasses,
      totalBookings,
      classByType,
      topClasses,
    ] = await Promise.all([
      prisma.class.count(),
      prisma.class.count({ where: { isActive: true } }),
      prisma.classBooking.count(),
      prisma.class.groupBy({
        by: ['classType'],
        _count: true,
        orderBy: { _count: { classType: 'desc' } },
      }),
      prisma.class.findMany({
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
  static async getClassSchedules(classId: string) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    const schedules = await prisma.classSchedule.findMany({
      where: { classId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return schedules;
  }

  static async createClassSchedule(
    classId: string,
    data: any,
    userId: string,
    userRole: string,
    createdBy: string
  ) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { trainer: { include: { user: true } } },
    });

    if (!classData) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    // Check authorization for trainers
    if (userRole === Role.TRAINER) {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || trainer.id !== classData.trainerId) {
        throw new AppError(
          'You can only create schedules for your own classes',
          httpStatus.FORBIDDEN
        );
      }
    }

    // Check for conflicting schedules
    const conflictingSchedule = await prisma.classSchedule.findFirst({
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
      throw new AppError(
        'Schedule conflicts with existing schedule',
        httpStatus.BAD_REQUEST
      );
    }

    const schedule = await prisma.$transaction(async (tx) => {
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

  static async updateClassSchedule(
    classId: string,
    scheduleId: string,
    data: any,
    userId: string,
    userRole: string,
    updatedBy: string
  ) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { trainer: { include: { user: true } } },
    });

    if (!classData) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || schedule.classId !== classId) {
      throw new AppError('Schedule not found', httpStatus.NOT_FOUND);
    }

    // Check authorization for trainers
    if (userRole === Role.TRAINER) {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || trainer.id !== classData.trainerId) {
        throw new AppError(
          'You can only update schedules for your own classes',
          httpStatus.FORBIDDEN
        );
      }
    }

    const updatedSchedule = await prisma.$transaction(async (tx) => {
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

  static async deleteClassSchedule(
    classId: string,
    scheduleId: string,
    userId: string,
    userRole: string,
    deletedBy: string
  ) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { trainer: { include: { user: true } } },
    });

    if (!classData) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!schedule || schedule.classId !== classId) {
      throw new AppError('Schedule not found', httpStatus.NOT_FOUND);
    }

    // Check authorization for trainers
    if (userRole === Role.TRAINER) {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || trainer.id !== classData.trainerId) {
        throw new AppError(
          'You can only delete schedules for your own classes',
          httpStatus.FORBIDDEN
        );
      }
    }

    if (schedule._count.bookings > 0) {
      throw new AppError(
        'Cannot delete schedule with existing bookings',
        httpStatus.BAD_REQUEST
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.classSchedule.delete({
        where: { id: scheduleId },
      });

    });

    return { message: 'Schedule deleted successfully' };
  }
}