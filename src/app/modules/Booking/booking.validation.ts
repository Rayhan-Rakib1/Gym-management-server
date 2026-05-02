
import { BookingStatus } from "@prisma/client";
import z from "zod";

export const bookClassSchema = z.object({
  body: z
    .object({
      classId: z
        .string({ message: 'Class ID is required' })
        .uuid('Invalid class ID format'),

      scheduleId: z
        .string({ message: 'Schedule ID is required' })
        .uuid('Invalid schedule ID format'),

      bookingDate: z
        .string({ message: 'Booking date is required' })
        .datetime('Invalid date format')
        .or(z.date()),
    })
    .refine(
      (data) => {
        const bookingDate = new Date(data.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      },
      {
        message: 'Cannot book classes in the past',
        path: ['bookingDate'],
      }
    )
    .refine(
      (data) => {
        const bookingDate = new Date(data.bookingDate);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return bookingDate <= maxDate;
      },
      {
        message: 'Cannot book classes more than 30 days in advance',
        path: ['bookingDate'],
      }
    ),
});

export const getMemberBookingsQuerySchema = z.object({
  params: z.object({
    memberId: z.string().uuid('Invalid member ID format'),
  }),
  query: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    upcoming: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
  }),
});

export const getClassBookingsQuerySchema = z.object({
  params: z.object({
    classId: z.string().uuid('Invalid class ID format'),
  }),
  query: z.object({
    date: z.string().datetime().optional().or(z.date().optional()),
    status: z.nativeEnum(BookingStatus).optional(),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
  }),
});

export const bookingIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
});