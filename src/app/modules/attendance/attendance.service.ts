import prisma from "../../../shared/prisma";
import { AppError } from "../../errors/ApiError";
import httpStatus from 'http-status';


export class AttendanceService {
  /**
   * Member Check-in
   */
  static async checkIn(data: any) {
    const { memberId, notes } = data;

    // Verify member exists and is active
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: true,
      },
    });

    if (!member) {
      throw new AppError('Member not found', httpStatus.NOT_FOUND);
    }

    if (!member.user.isActive) {
      throw new AppError('Member account is inactive', httpStatus.FORBIDDEN);
    }

    // Check if membership is valid
    if (member.membershipEndDate && member.membershipEndDate < new Date()) {
      throw new AppError('Membership has expired. Please renew to check in.', httpStatus.FORBIDDEN);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        memberId_date: {
          memberId,
          date: today,
        },
      },
    });

    if (existingAttendance) {
      if (existingAttendance.checkOutTime) {
        throw new AppError('You have already completed your session today', httpStatus.BAD_REQUEST);
      }
      throw new AppError('You are already checked in', httpStatus.BAD_REQUEST);
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        memberId,
        checkInTime: new Date(),
        date: today,
        notes,
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
      },
    });

    return attendance;
  }

  /**
   * Member Check-out
   */
  static async checkOut(data: any) {
    const { memberId, notes } = data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await prisma.attendance.findUnique({
      where: {
        memberId_date: {
          memberId,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw new AppError('No check-in found for today. Please check in first.', httpStatus.NOT_FOUND);
    }

    if (attendance.checkOutTime) {
      throw new AppError('Already checked out', httpStatus.BAD_REQUEST);
    }

    // Update attendance with check-out time
    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: new Date(),
        notes: notes || attendance.notes,
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
      },
    });

    return updated;
  }

  /**
   * Manual attendance entry (Admin only)
   */
  static async createManualAttendance(data: any, createdBy: string) {
    const { memberId, date, checkInTime, checkOutTime, notes } = data;

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new AppError('Member not found', httpStatus.NOT_FOUND);
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    const existing = await prisma.attendance.findUnique({
      where: {
        memberId_date: {
          memberId,
          date: attendanceDate,
        },
      },
    });

    if (existing) {
      throw new AppError('Attendance record already exists for this date', httpStatus.BAD_REQUEST);
    }

    // Parse times
    const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
    const checkInDateTime = new Date(attendanceDate);
    checkInDateTime.setHours(checkInHour, checkInMinute, 0, 0);

    let checkOutDateTime: Date | null = null;
    if (checkOutTime) {
      const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
      checkOutDateTime = new Date(attendanceDate);
      checkOutDateTime.setHours(checkOutHour, checkOutMinute, 0, 0);

      // Validate check-out is after check-in
      if (checkOutDateTime <= checkInDateTime) {
        throw new AppError('Check-out time must be after check-in time', httpStatus.BAD_REQUEST);
      }
    }

    const attendance = await prisma.$transaction(async (tx) => {
      const record = await tx.attendance.create({
        data: {
          memberId,
          checkInTime: checkInDateTime,
          checkOutTime: checkOutDateTime,
          date: attendanceDate,
          notes,
        },
        include: {
          member: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return record;
    });

    return attendance;
  }

  /**
   * Get all attendance records
   */
  static async getAllAttendance(query: any) {
    const {
      page = '1',
      limit = '10',
      memberId,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.attendance.count({ where });

    // Get attendance records
    const attendance = await prisma.attendance.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: order,
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                profileImage: true,
              },
            },
            currentPlan: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      attendance,
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
   * Get today's attendance
   */
  static async getTodayAttendance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: today,
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
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    const checkedIn = attendance.filter((a) => !a.checkOutTime).length;
    const checkedOut = attendance.filter((a) => a.checkOutTime).length;

    return {
      attendance,
      stats: {
        total: attendance.length,
        checkedIn,
        checkedOut,
      },
    };
  }

  /**
   * Get attendance by date
   */
  static async getAttendanceByDate(date: string) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: targetDate,
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
      },
      orderBy: {
        checkInTime: 'asc',
      },
    });

    return attendance;
  }

  /**
   * Get member attendance history
   */
  static async getMemberAttendance(memberId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where: { memberId },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({
        where: { memberId },
      }),
    ]);

    return {
      attendance,
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
   * Delete attendance record
   */
  static async deleteAttendance(attendanceId: string, deletedBy: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new AppError('Attendance record not found', httpStatus.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.attendance.delete({
        where: { id: attendanceId },
      });

    });

    return { message: 'Attendance record deleted successfully' };
  }

  /**
   * Get attendance statistics
   */
  static async getAttendanceStats(query: any) {
    const { startDate, endDate } = query;

    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [
      totalAttendance,
      uniqueMembers,
      avgDailyAttendance,
      attendanceByDay,
      peakHours,
    ] = await Promise.all([
      // Total attendance count
      prisma.attendance.count({ where }),

      // Unique members who attended
      prisma.attendance.findMany({
        where,
        distinct: ['memberId'],
        select: { memberId: true },
      }),

      // Average daily attendance
      prisma.attendance.groupBy({
        by: ['date'],
        where,
        _count: true,
      }),

      // Attendance by day of week
      prisma.$queryRaw`
        SELECT 
          EXTRACT(DOW FROM date) as day_of_week,
          COUNT(*) as count
        FROM "Attendance"
        ${startDate || endDate ? prisma.$queryRaw`WHERE date >= ${startDate ? new Date(startDate) : new Date('1970-01-01')} AND date <= ${endDate ? new Date(endDate) : new Date()}` : prisma.$queryRaw``}
        GROUP BY day_of_week
        ORDER BY day_of_week
      `,

      // Peak hours
      prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM "checkInTime") as hour,
          COUNT(*) as count
        FROM "Attendance"
        ${startDate || endDate ? prisma.$queryRaw`WHERE date >= ${startDate ? new Date(startDate) : new Date('1970-01-01')} AND date <= ${endDate ? new Date(endDate) : new Date()}` : prisma.$queryRaw``}
        GROUP BY hour
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

    const avgDaily =
      avgDailyAttendance.length > 0
        ? avgDailyAttendance.reduce((sum, day) => sum + day._count, 0) /
          avgDailyAttendance.length
        : 0;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      totalAttendance,
      uniqueMembers: uniqueMembers.length,
      avgDailyAttendance: Math.round(avgDaily),
      attendanceByDay: (attendanceByDay as any[]).map((item) => ({
        day: dayNames[Number(item.day_of_week)],
        count: Number(item.count),
      })),
      peakHours: (peakHours as any[]).map((item) => ({
        hour: `${item.hour}:00`,
        count: Number(item.count),
      })),
    };
  }

  /**
   * Get member attendance rate
   */
  static async getMemberAttendanceRate(memberId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [attendance, member] = await Promise.all([
      prisma.attendance.count({
        where: {
          memberId,
          date: {
            gte: startDate,
          },
        },
      }),
      prisma.member.findUnique({
        where: { id: memberId },
        select: {
          weeklyFrequency: true,
        },
      }),
    ]);

    if (!member) {
      throw new AppError('Member not found', httpStatus.NOT_FOUND);
    }

    const weeks = days / 7;
    const expectedAttendance = member.weeklyFrequency * weeks;
    const attendanceRate =
      expectedAttendance > 0 ? (attendance / expectedAttendance) * 100 : 0;

    return {
      days,
      actualAttendance: attendance,
      expectedAttendance: Math.round(expectedAttendance),
      attendanceRate: Math.round(attendanceRate),
      weeklyFrequency: member.weeklyFrequency,
    };
  }
}
