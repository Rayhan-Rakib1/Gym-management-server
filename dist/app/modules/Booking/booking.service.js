"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const client_1 = require("@prisma/client");
class BookingService {
    static async bookClass(data) {
        // Get member from userId
        const member = await prisma_1.default.member.findUnique({
            where: { userId: data.userId },
            include: {
                currentPlan: true,
                user: true,
            },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member profile not found', http_status_1.default.NOT_FOUND);
        }
        // Check membership status
        if (!member.membershipEndDate ||
            new Date(member.membershipEndDate) < new Date()) {
            throw new ApiError_1.AppError('Your membership has expired. Please renew to book classes.', http_status_1.default.BAD_REQUEST);
        }
        // Verify class exists and is active
        const classData = await prisma_1.default.class.findUnique({
            where: { id: data.classId },
            include: {
                trainer: {
                    include: { user: true },
                },
            },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        if (!classData.isActive) {
            throw new ApiError_1.AppError('This class is currently not available', http_status_1.default.BAD_REQUEST);
        }
        // Verify schedule exists
        const schedule = await prisma_1.default.classSchedule.findUnique({
            where: { id: data.scheduleId },
        });
        if (!schedule || schedule.classId !== data.classId) {
            throw new ApiError_1.AppError('Schedule not found', http_status_1.default.NOT_FOUND);
        }
        const bookingDate = new Date(data.bookingDate);
        // Check if member already booked this class on this date
        const existingBooking = await prisma_1.default.classBooking.findFirst({
            where: {
                scheduleId: data.scheduleId,
                memberId: member.id,
                bookingDate,
                status: {
                    in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.WAITLIST],
                },
            },
        });
        if (existingBooking) {
            throw new ApiError_1.AppError('You have already booked this class on this date', http_status_1.default.BAD_REQUEST);
        }
        // Count current bookings for this schedule and date
        const bookingsCount = await prisma_1.default.classBooking.count({
            where: {
                scheduleId: data.scheduleId,
                bookingDate,
                status: client_1.BookingStatus.CONFIRMED,
            },
        });
        // Determine booking status based on capacity
        const status = bookingsCount >= classData.capacity
            ? client_1.BookingStatus.WAITLIST
            : client_1.BookingStatus.CONFIRMED;
        // Create booking
        const booking = await prisma_1.default.$transaction(async (tx) => {
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
    static async getMemberBookings(memberId, filters, userId, userRole) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own bookings', http_status_1.default.FORBIDDEN);
        }
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = { memberId };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.upcoming) {
            where.bookingDate = {
                gte: new Date(),
            };
        }
        const [bookings, total] = await Promise.all([
            prisma_1.default.classBooking.findMany({
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
            prisma_1.default.classBooking.count({ where }),
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
    static async getClassBookings(classId, filters, userId, userRole) {
        const classData = await prisma_1.default.class.findUnique({
            where: { id: classId },
            include: { trainer: true },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        // Verify trainer authorization
        if (userRole === client_1.Role.TRAINER) {
            if (classData.trainer.userId !== userId) {
                throw new ApiError_1.AppError('You can only view bookings for your own classes', http_status_1.default.FORBIDDEN);
            }
        }
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = { classId };
        if (filters.date) {
            where.bookingDate = filters.date;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        const [bookings, total] = await Promise.all([
            prisma_1.default.classBooking.findMany({
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
            prisma_1.default.classBooking.count({ where }),
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
    static async cancelBooking(bookingId, userId, userRole) {
        const booking = await prisma_1.default.classBooking.findUnique({
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
            throw new ApiError_1.AppError('Booking not found', http_status_1.default.NOT_FOUND);
        }
        // Check authorization
        if (userRole === client_1.Role.MEMBER && booking.member.userId !== userId) {
            throw new ApiError_1.AppError('You can only cancel your own bookings', http_status_1.default.FORBIDDEN);
        }
        if (booking.status === client_1.BookingStatus.CANCELLED) {
            throw new ApiError_1.AppError('Booking is already cancelled', http_status_1.default.BAD_REQUEST);
        }
        if (booking.status === client_1.BookingStatus.COMPLETED) {
            throw new ApiError_1.AppError('Cannot cancel completed bookings', http_status_1.default.BAD_REQUEST);
        }
        // Check if booking date has passed
        if (new Date(booking.bookingDate) < new Date()) {
            throw new ApiError_1.AppError('Cannot cancel past bookings', http_status_1.default.BAD_REQUEST);
        }
        // Update booking status
        const updatedBooking = await prisma_1.default.$transaction(async (tx) => {
            const updated = await tx.classBooking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.CANCELLED },
                include: {
                    member: { include: { user: true } },
                    class: true,
                    schedule: true,
                },
            });
            // If there was a waitlisted booking, promote it
            if (booking.status === client_1.BookingStatus.CONFIRMED) {
                const waitlistBooking = await tx.classBooking.findFirst({
                    where: {
                        scheduleId: booking.scheduleId,
                        bookingDate: booking.bookingDate,
                        status: client_1.BookingStatus.WAITLIST,
                    },
                    orderBy: { createdAt: 'asc' },
                    include: {
                        member: { include: { user: true } },
                    },
                });
                if (waitlistBooking) {
                    await tx.classBooking.update({
                        where: { id: waitlistBooking.id },
                        data: { status: client_1.BookingStatus.CONFIRMED },
                    });
                }
            }
            return updated;
        });
        return updatedBooking;
    }
    static async completeBooking(bookingId, completedBy) {
        const booking = await prisma_1.default.classBooking.findUnique({
            where: { id: bookingId },
            include: {
                member: { include: { user: true } },
                class: true,
            },
        });
        if (!booking) {
            throw new ApiError_1.AppError('Booking not found', http_status_1.default.NOT_FOUND);
        }
        if (booking.status !== client_1.BookingStatus.CONFIRMED) {
            throw new ApiError_1.AppError('Only confirmed bookings can be marked as completed', http_status_1.default.BAD_REQUEST);
        }
        const updatedBooking = await prisma_1.default.$transaction(async (tx) => {
            const updated = await tx.classBooking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.COMPLETED },
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
    static async getUpcomingBookings(userId) {
        const member = await prisma_1.default.member.findUnique({
            where: { userId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member profile not found', http_status_1.default.NOT_FOUND);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingBookings = await prisma_1.default.classBooking.findMany({
            where: {
                memberId: member.id,
                bookingDate: { gte: today },
                status: {
                    in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.WAITLIST],
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
    static async getBookingStats(classId) {
        const classData = await prisma_1.default.class.findUnique({
            where: { id: classId },
        });
        if (!classData) {
            throw new ApiError_1.AppError('Class not found', http_status_1.default.NOT_FOUND);
        }
        const [totalBookings, confirmedBookings, waitlistBookings, completedBookings, cancelledBookings,] = await Promise.all([
            prisma_1.default.classBooking.count({
                where: { classId },
            }),
            prisma_1.default.classBooking.count({
                where: { classId, status: client_1.BookingStatus.CONFIRMED },
            }),
            prisma_1.default.classBooking.count({
                where: { classId, status: client_1.BookingStatus.WAITLIST },
            }),
            prisma_1.default.classBooking.count({
                where: { classId, status: client_1.BookingStatus.COMPLETED },
            }),
            prisma_1.default.classBooking.count({
                where: { classId, status: client_1.BookingStatus.CANCELLED },
            }),
        ]);
        return {
            totalBookings,
            confirmedBookings,
            waitlistBookings,
            completedBookings,
            cancelledBookings,
            capacity: classData.capacity,
            utilizationRate: confirmedBookings > 0
                ? ((confirmedBookings / classData.capacity) * 100).toFixed(2)
                : '0.00',
        };
    }
}
exports.BookingService = BookingService;
