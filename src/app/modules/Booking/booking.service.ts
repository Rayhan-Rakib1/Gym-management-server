import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';
import { BookingStatus, Role } from '@prisma/client';

export class BookingService {

  static async bookClass(data: {
    classId: string;
    scheduleId: string;
    bookingDate: Date | string;
    userId: string;
  }) {
    // Get member from userId
    const member = await prisma.member.findUnique({
      where: { userId: data.userId },
      include: {
        currentPlan: true,
        user: true,
      },
    });

    if (!member) {
      throw new AppError('Member profile not found', httpStatus.NOT_FOUND);
    }

    // Check membership status
    if (
      !member.membershipEndDate ||
      new Date(member.membershipEndDate) < new Date()
    ) {
      throw new AppError(
        'Your membership has expired. Please renew to book classes.',
        httpStatus.BAD_REQUEST
      );
    }

    // Verify class exists and is active
    const classData = await prisma.class.findUnique({
      where: { id: data.classId },
      include: {
        trainer: {
          include: { user: true },
        },
      },
    });

    if (!classData) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    if (!classData.isActive) {
      throw new AppError(
        'This class is currently not available',
        httpStatus.BAD_REQUEST
      );
    }

    // Verify schedule exists
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: data.scheduleId },
    });

    if (!schedule || schedule.classId !== data.classId) {
      throw new AppError('Schedule not found', httpStatus.NOT_FOUND);
    }

    const bookingDate = new Date(data.bookingDate);

    // Check if member already booked this class on this date
    const existingBooking = await prisma.classBooking.findFirst({
      where: {
        scheduleId: data.scheduleId,
        memberId: member.id,
        bookingDate,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.WAITLIST],
        },
      },
    });

    if (existingBooking) {
      throw new AppError(
        'You have already booked this class on this date',
        httpStatus.BAD_REQUEST
      );
    }

    // Count current bookings for this schedule and date
    const bookingsCount = await prisma.classBooking.count({
      where: {
        scheduleId: data.scheduleId,
        bookingDate,
        status: BookingStatus.CONFIRMED,
      },
    });

    // Determine booking status based on capacity
    const status: BookingStatus =
      bookingsCount >= classData.capacity
        ? BookingStatus.WAITLIST
        : BookingStatus.CONFIRMED;

    // Create booking
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.classBooking.create({
        data: {
          classId: data.classId,
          scheduleId: data.scheduleId,
          memberId: member.id,
          bookingDate,
          status,
        },
        include: {
          class: {
            include: {
              trainer: {
                include: { user: true },
              },
            },
          },
          schedule: true,
          member: {
            include: { user: true },
          },
        },
      });

      return newBooking;
    });

    return booking;
  }

  static async getMemberBookings(
    memberId: string,
    filters: {
      status?: BookingStatus;
      upcoming?: boolean;
      page?: number;
      limit?: number;
    },
    userId: string,
    userRole: string
  ) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new AppError('Member not found', httpStatus.NOT_FOUND);
    }

    // Verify authorization
    if (userRole === Role.MEMBER && member.userId !== userId) {
      throw new AppError(
        'You can only view your own bookings',
        httpStatus.FORBIDDEN
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { memberId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.upcoming) {
      where.bookingDate = {
        gte: new Date(),
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.classBooking.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: {
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
          },
          schedule: true,
        },
        orderBy: { bookingDate: 'desc' },
      }),
      prisma.classBooking.count({ where }),
    ]);

    return {
      bookings,
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

  static async getClassBookings(
    classId: string,
    filters: {
      date?: Date;
      status?: BookingStatus;
      page?: number;
      limit?: number;
    },
    userId: string,
    userRole: string
  ) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { trainer: true },
    });

    if (!classData) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    // Verify trainer authorization
    if (userRole === Role.TRAINER) {
      if (classData.trainer.userId !== userId) {
        throw new AppError(
          'You can only view bookings for your own classes',
          httpStatus.FORBIDDEN
        );
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { classId };

    if (filters.date) {
      where.bookingDate = filters.date;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [bookings, total] = await Promise.all([
      prisma.classBooking.findMany({
        where,
        skip,
        take: limit,
        include: {
          member: {
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
          schedule: true,
        },
        orderBy: [{ bookingDate: 'desc' }, { createdAt: 'asc' }],
      }),
      prisma.classBooking.count({ where }),
    ]);

    return {
      bookings,
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

  static async cancelBooking(
    bookingId: string,
    userId: string,
    userRole: string
  ) {
    const booking = await prisma.classBooking.findUnique({
      where: { id: bookingId },
      include: {
        member: { include: { user: true } },
        class: {
          include: {
            trainer: { include: { user: true } },
          },
        },
        schedule: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', httpStatus.NOT_FOUND);
    }

    // Check authorization
    if (userRole === Role.MEMBER && booking.member.userId !== userId) {
      throw new AppError(
        'You can only cancel your own bookings',
        httpStatus.FORBIDDEN
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError(
        'Booking is already cancelled',
        httpStatus.BAD_REQUEST
      );
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError(
        'Cannot cancel completed bookings',
        httpStatus.BAD_REQUEST
      );
    }

    // Check if booking date has passed
    if (new Date(booking.bookingDate) < new Date()) {
      throw new AppError(
        'Cannot cancel past bookings',
        httpStatus.BAD_REQUEST
      );
    }

    // Update booking status
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.classBooking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
        include: {
          member: { include: { user: true } },
          class: true,
          schedule: true,
        },
      });

      // If there was a waitlisted booking, promote it
      if (booking.status === BookingStatus.CONFIRMED) {
        const waitlistBooking = await tx.classBooking.findFirst({
          where: {
            scheduleId: booking.scheduleId,
            bookingDate: booking.bookingDate,
            status: BookingStatus.WAITLIST,
          },
          orderBy: { createdAt: 'asc' },
          include: {
            member: { include: { user: true } },
          },
        });

        if (waitlistBooking) {
          await tx.classBooking.update({
            where: { id: waitlistBooking.id },
            data: { status: BookingStatus.CONFIRMED },
          });
        }
      }

      return updated;
    });

    return updatedBooking;
  }

  static async completeBooking(bookingId: string, completedBy: string) {
    const booking = await prisma.classBooking.findUnique({
      where: { id: bookingId },
      include: {
        member: { include: { user: true } },
        class: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', httpStatus.NOT_FOUND);
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(
        'Only confirmed bookings can be marked as completed',
        httpStatus.BAD_REQUEST
      );
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.classBooking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED },
        include: {
          member: { include: { user: true } },
          class: true,
          schedule: true,
        },
      });

      return updated;
    });

    return updatedBooking;
  }

  static async getUpcomingBookings(userId: string) {
    const member = await prisma.member.findUnique({
      where: { userId },
    });

    if (!member) {
      throw new AppError('Member profile not found', httpStatus.NOT_FOUND);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBookings = await prisma.classBooking.findMany({
      where: {
        memberId: member.id,
        bookingDate: { gte: today },
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.WAITLIST],
        },
      },
      include: {
        class: {
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
        },
        schedule: true,
      },
      orderBy: [{ bookingDate: 'asc' }, { schedule: { startTime: 'asc' } }],
      take: 10,
    });

    return upcomingBookings;
  }

  // ============================================
  // STATISTICS
  // ============================================

  static async getBookingStats(classId: string) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      throw new AppError('Class not found', httpStatus.NOT_FOUND);
    }

    const [
      totalBookings,
      confirmedBookings,
      waitlistBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.classBooking.count({
        where: { classId },
      }),
      prisma.classBooking.count({
        where: { classId, status: BookingStatus.CONFIRMED },
      }),
      prisma.classBooking.count({
        where: { classId, status: BookingStatus.WAITLIST },
      }),
      prisma.classBooking.count({
        where: { classId, status: BookingStatus.COMPLETED },
      }),
      prisma.classBooking.count({
        where: { classId, status: BookingStatus.CANCELLED },
      }),
    ]);

    return {
      totalBookings,
      confirmedBookings,
      waitlistBookings,
      completedBookings,
      cancelledBookings,
      capacity: classData.capacity,
      utilizationRate:
        confirmedBookings > 0
          ? ((confirmedBookings / classData.capacity) * 100).toFixed(2)
          : '0.00',
    };
  }
}