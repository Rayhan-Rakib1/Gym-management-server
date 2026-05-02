
import httpStatus from 'http-status';
import { PhotoType, Role } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';

export class ProgressService {

    static async createBodyMetric(data: any, createdBy: string) {
        const {
            memberId,
            recordDate,
            weight,
            bmi,
            bodyFat,
            muscleMass,
            chest,
            waist,
            hips,
            biceps,
            thighs,
            notes,
        } = data;

        // Verify member exists
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: true },
        });

        if (!member) {
            throw new AppError('Member not found', httpStatus.NOT_FOUND);
        }

        const date = recordDate ? new Date(recordDate) : new Date();
        date.setHours(0, 0, 0, 0);

        // Check if metric already exists for this date
        const existingMetric = await prisma.bodyMetric.findUnique({
            where: {
                memberId_recordDate: {
                    memberId,
                    recordDate: date,
                },
            },
        });

        if (existingMetric) {
            throw new AppError(
                'Body metric already exists for this date. Please update the existing record.',
                httpStatus.BAD_REQUEST
            );
        }

        // Calculate BMI if weight is provided and member has height
        let calculatedBMI = bmi;
        if (weight && member.height && !bmi) {
            calculatedBMI = this.calculateBMI(weight, member.height);
        }

        const bodyMetric = await prisma.$transaction(async (tx) => {
            const newMetric = await tx.bodyMetric.create({
                data: {
                    memberId,
                    recordDate: date,
                    weight,
                    bmi: calculatedBMI,
                    bodyFat,
                    muscleMass,
                    chest,
                    waist,
                    hips,
                    biceps,
                    thighs,
                    notes,
                },
            });

            // Update member's current weight if this is the latest record
            if (weight) {
                await tx.member.update({
                    where: { id: memberId },
                    data: { currentWeight: weight },
                });
            }

            return newMetric;
        });

        return bodyMetric;
    }

    static async getMemberMetrics(
        memberId: string,
        filters: {
            startDate?: Date;
            endDate?: Date;
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
                'You can only view your own metrics',
                httpStatus.FORBIDDEN
            );
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = { memberId };

        if (filters.startDate || filters.endDate) {
            where.recordDate = {};
            if (filters.startDate) {
                where.recordDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.recordDate.lte = new Date(filters.endDate);
            }
        }

        const [metrics, total] = await Promise.all([
            prisma.bodyMetric.findMany({
                where,
                skip,
                take: limit,
                orderBy: { recordDate: 'desc' },
            }),
            prisma.bodyMetric.count({ where }),
        ]);

        return {
            metrics,
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

    static async getMetricById(metricId: string, userId: string, userRole: string) {
        const metric = await prisma.bodyMetric.findUnique({
            where: { id: metricId },
            include: {
                member: {
                    include: { user: true },
                },
            },
        });

        if (!metric) {
            throw new AppError('Body metric not found', httpStatus.NOT_FOUND);
        }

        // Verify authorization
        if (userRole === Role.MEMBER && metric.member.userId !== userId) {
            throw new AppError(
                'You can only view your own metrics',
                httpStatus.FORBIDDEN
            );
        }

        return metric;
    }

    static async updateBodyMetric(
        metricId: string,
        data: any,
        userId: string,
        userRole: string,
        updatedBy: string
    ) {
        const existingMetric = await prisma.bodyMetric.findUnique({
            where: { id: metricId },
            include: { member: true },
        });

        if (!existingMetric) {
            throw new AppError('Body metric not found', httpStatus.NOT_FOUND);
        }

        // Verify authorization
        if (
            userRole === Role.MEMBER &&
            existingMetric.member.userId !== userId
        ) {
            throw new AppError(
                'You can only update your own metrics',
                httpStatus.FORBIDDEN
            );
        }

        // Calculate BMI if weight is updated
        let calculatedBMI = data.bmi;
        if (data.weight && existingMetric.member.height && !data.bmi) {
            calculatedBMI = this.calculateBMI(data.weight, existingMetric.member.height);
        }

        const updatedMetric = await prisma.$transaction(async (tx) => {
            const updated = await tx.bodyMetric.update({
                where: { id: metricId },
                data: {
                    recordDate: data.recordDate ? new Date(data.recordDate) : undefined,
                    weight: data.weight,
                    bmi: calculatedBMI,
                    bodyFat: data.bodyFat,
                    muscleMass: data.muscleMass,
                    chest: data.chest,
                    waist: data.waist,
                    hips: data.hips,
                    biceps: data.biceps,
                    thighs: data.thighs,
                    notes: data.notes,
                },
            });

            // Update member's current weight if this is the latest record
            if (data.weight) {
                const latestMetric = await tx.bodyMetric.findFirst({
                    where: { memberId: existingMetric.memberId },
                    orderBy: { recordDate: 'desc' },
                });

                if (latestMetric?.id === metricId) {
                    await tx.member.update({
                        where: { id: existingMetric.memberId },
                        data: { currentWeight: data.weight },
                    });
                }
            }

            return updated;
        });

        return updatedMetric;
    }

    static async deleteBodyMetric(
        metricId: string,
        userId: string,
        userRole: string,
        deletedBy: string
    ) {
        const existingMetric = await prisma.bodyMetric.findUnique({
            where: { id: metricId },
            include: { member: true },
        });

        if (!existingMetric) {
            throw new AppError('Body metric not found', httpStatus.NOT_FOUND);
        }

        // Verify authorization
        if (
            userRole === Role.MEMBER &&
            existingMetric.member.userId !== userId
        ) {
            throw new AppError(
                'You can only delete your own metrics',
                httpStatus.FORBIDDEN
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.bodyMetric.delete({
                where: { id: metricId },
            });

        });

        return { message: 'Body metric deleted successfully' };
    }

    static async getLatestMetric(memberId: string, userId: string, userRole: string) {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            throw new AppError('Member not found', httpStatus.NOT_FOUND);
        }

        // Verify authorization
        if (userRole === Role.MEMBER && member.userId !== userId) {
            throw new AppError(
                'You can only view your own metrics',
                httpStatus.FORBIDDEN
            );
        }

        const latestMetric = await prisma.bodyMetric.findFirst({
            where: { memberId },
            orderBy: { recordDate: 'desc' },
        });

        return latestMetric;
    }

    // ============================================
    // PROGRESS PHOTOS OPERATIONS
    // ============================================

    static async uploadProgressPhoto(data: any, uploadedBy: string) {
        const { memberId, photoDate, imageUrl, photoType, notes } = data;

        // Verify member exists
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: true },
        });

        if (!member) {
            throw new AppError('Member not found', httpStatus.NOT_FOUND);
        }

        const date = photoDate ? new Date(photoDate) : new Date();
        date.setHours(0, 0, 0, 0);

        const progressPhoto = await prisma.$transaction(async (tx) => {
            const newPhoto = await tx.progressPhoto.create({
                data: {
                    memberId,
                    photoDate: date,
                    imageUrl,
                    photoType,
                    notes,
                },
            });

            return newPhoto;
        });

        return progressPhoto;
    }

    static async getMemberPhotos(
        memberId: string,
        filters: {
            photoType?: PhotoType;
            startDate?: Date;
            endDate?: Date;
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
                'You can only view your own photos',
                httpStatus.FORBIDDEN
            );
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = { memberId };

        if (filters.photoType) {
            where.photoType = filters.photoType;
        }

        if (filters.startDate || filters.endDate) {
            where.photoDate = {};
            if (filters.startDate) {
                where.photoDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.photoDate.lte = new Date(filters.endDate);
            }
        }

        const [photos, total] = await Promise.all([
            prisma.progressPhoto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { photoDate: 'desc' },
            }),
            prisma.progressPhoto.count({ where }),
        ]);

        return {
            photos,
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

    static async getPhotoById(photoId: string, userId: string, userRole: string) {
        const photo = await prisma.progressPhoto.findUnique({
            where: { id: photoId },
            include: {
                member: {
                    include: { user: true },
                },
            },
        });

        if (!photo) {
            throw new AppError('Progress photo not found', httpStatus.NOT_FOUND);
        }

        // Verify authorization
        if (userRole === Role.MEMBER && photo.member.userId !== userId) {
            throw new AppError(
                'You can only view your own photos',
                httpStatus.FORBIDDEN
            );
        }

        return photo;
    }

    static async deleteProgressPhoto(
        photoId: string,
        userId: string,
        userRole: string,
        deletedBy: string
    ) {
        const existingPhoto = await prisma.progressPhoto.findUnique({
            where: { id: photoId },
            include: { member: true },
        });

        if (!existingPhoto) {
            throw new AppError('Progress photo not found', httpStatus.NOT_FOUND);
        }

        // Verify authorization
        if (
            userRole === Role.MEMBER &&
            existingPhoto.member.userId !== userId
        ) {
            throw new AppError(
                'You can only delete your own photos',
                httpStatus.FORBIDDEN
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.progressPhoto.delete({
                where: { id: photoId },
            });

        });

        return { message: 'Progress photo deleted successfully' };
    }

    // ============================================
    // ANALYTICS & COMPARISON
    // ============================================

    static async compareMetrics(
        memberId: string,
        startDate: Date,
        endDate: Date,
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
                'You can only view your own metrics',
                httpStatus.FORBIDDEN
            );
        }

        const startMetric = await prisma.bodyMetric.findFirst({
            where: {
                memberId,
                recordDate: { gte: new Date(startDate) },
            },
            orderBy: { recordDate: 'asc' },
        });

        const endMetric = await prisma.bodyMetric.findFirst({
            where: {
                memberId,
                recordDate: { lte: new Date(endDate) },
            },
            orderBy: { recordDate: 'desc' },
        });

        if (!startMetric || !endMetric) {
            throw new AppError(
                'Insufficient data for comparison',
                httpStatus.BAD_REQUEST
            );
        }

        const comparison = {
            period: {
                start: startMetric.recordDate,
                end: endMetric.recordDate,
                days: Math.ceil(
                    (endMetric.recordDate.getTime() - startMetric.recordDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
            },
            weight: {
                start: startMetric.weight,
                end: endMetric.weight,
                change: endMetric.weight
                    ? (endMetric.weight || 0) - (startMetric.weight || 0)
                    : null,
                percentChange: this.calculatePercentChange(
                    startMetric.weight,
                    endMetric.weight
                ),
            },
            bmi: {
                start: startMetric.bmi,
                end: endMetric.bmi,
                change: endMetric.bmi
                    ? (endMetric.bmi || 0) - (startMetric.bmi || 0)
                    : null,
            },
            bodyFat: {
                start: startMetric.bodyFat,
                end: endMetric.bodyFat,
                change: endMetric.bodyFat
                    ? (endMetric.bodyFat || 0) - (startMetric.bodyFat || 0)
                    : null,
            },
            muscleMass: {
                start: startMetric.muscleMass,
                end: endMetric.muscleMass,
                change: endMetric.muscleMass
                    ? (endMetric.muscleMass || 0) - (startMetric.muscleMass || 0)
                    : null,
            },
            measurements: {
                chest: this.getMeasurementComparison(
                    startMetric.chest,
                    endMetric.chest
                ),
                waist: this.getMeasurementComparison(
                    startMetric.waist,
                    endMetric.waist
                ),
                hips: this.getMeasurementComparison(startMetric.hips, endMetric.hips),
                biceps: this.getMeasurementComparison(
                    startMetric.biceps,
                    endMetric.biceps
                ),
                thighs: this.getMeasurementComparison(
                    startMetric.thighs,
                    endMetric.thighs
                ),
            },
        };

        return comparison;
    }

    static async getProgressSummary(memberId: string, userId: string, userRole: string) {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            throw new AppError('Member not found', httpStatus.NOT_FOUND);
        }

        // Verify authorization
        if (userRole === Role.MEMBER && member.userId !== userId) {
            throw new AppError(
                'You can only view your own progress',
                httpStatus.FORBIDDEN
            );
        }

        const [totalMetrics, totalPhotos, latestMetric, firstMetric] =
            await Promise.all([
                prisma.bodyMetric.count({ where: { memberId } }),
                prisma.progressPhoto.count({ where: { memberId } }),
                prisma.bodyMetric.findFirst({
                    where: { memberId },
                    orderBy: { recordDate: 'desc' },
                }),
                prisma.bodyMetric.findFirst({
                    where: { memberId },
                    orderBy: { recordDate: 'asc' },
                }),
            ]);

        let overallProgress: {
            weightChange: string | null;
            bodyFatChange: string | null;
            muscleMassChange: string | null;
        } | null = null;

        if (firstMetric && latestMetric && firstMetric.id !== latestMetric.id) {
            overallProgress = {
                weightChange: latestMetric.weight && firstMetric.weight
                    ? (latestMetric.weight - firstMetric.weight).toFixed(2)
                    : null,
                bodyFatChange: latestMetric.bodyFat && firstMetric.bodyFat
                    ? (latestMetric.bodyFat - firstMetric.bodyFat).toFixed(2)
                    : null,
                muscleMassChange: latestMetric.muscleMass && firstMetric.muscleMass
                    ? (latestMetric.muscleMass - firstMetric.muscleMass).toFixed(2)
                    : null,
            };
        }

        return {
            totalMetrics,
            totalPhotos,
            latestMetric,
            firstMetric,
            overallProgress,
            trackingPeriod: firstMetric
                ? {
                    start: firstMetric.recordDate,
                    end: latestMetric?.recordDate,
                    days: latestMetric
                        ? Math.ceil(
                            (latestMetric.recordDate.getTime() -
                                firstMetric.recordDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                        : 0,
                }
                : null,
        };
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private static calculateBMI(weight: number, height: number): number {
        // Height is in cm, convert to meters
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return parseFloat(bmi.toFixed(2));
    }

    private static calculatePercentChange(
        start: number | null,
        end: number | null
    ): string | null {
        if (!start || !end || start === 0) return null;
        const change = ((end - start) / start) * 100;
        return change.toFixed(2);
    }

    private static getMeasurementComparison(
        start: number | null,
        end: number | null
    ) {
        if (!start || !end) return null;
        return {
            start,
            end,
            change: parseFloat((end - start).toFixed(2)),
        };
    }

    static calculateBMIPublic(weight: number, height: number) {
        const bmi = this.calculateBMI(weight, height);

        let category = '';
        let recommendation = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            recommendation = 'Consider consulting a nutritionist for a healthy weight gain plan';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal weight';
            recommendation = 'Maintain your healthy lifestyle';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            recommendation = 'Consider a balanced diet and regular exercise';
        } else {
            category = 'Obese';
            recommendation = 'Consult a healthcare professional for a weight management plan';
        }

        return {
            bmi,
            category,
            recommendation,
        };
    }
}