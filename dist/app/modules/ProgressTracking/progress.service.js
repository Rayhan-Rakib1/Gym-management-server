"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
class ProgressService {
    static async createBodyMetric(data, createdBy) {
        const { memberId, recordDate, weight, bmi, bodyFat, muscleMass, chest, waist, hips, biceps, thighs, notes, } = data;
        // Verify member exists
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
            include: { user: true },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        const date = recordDate ? new Date(recordDate) : new Date();
        date.setHours(0, 0, 0, 0);
        // Check if metric already exists for this date
        const existingMetric = await prisma_1.default.bodyMetric.findUnique({
            where: {
                memberId_recordDate: {
                    memberId,
                    recordDate: date,
                },
            },
        });
        if (existingMetric) {
            throw new ApiError_1.AppError('Body metric already exists for this date. Please update the existing record.', http_status_1.default.BAD_REQUEST);
        }
        // Calculate BMI if weight is provided and member has height
        let calculatedBMI = bmi;
        if (weight && member.height && !bmi) {
            calculatedBMI = this.calculateBMI(weight, member.height);
        }
        const bodyMetric = await prisma_1.default.$transaction(async (tx) => {
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
    static async getMemberMetrics(memberId, filters, userId, userRole) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own metrics', http_status_1.default.FORBIDDEN);
        }
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = { memberId };
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
            prisma_1.default.bodyMetric.findMany({
                where,
                skip,
                take: limit,
                orderBy: { recordDate: 'desc' },
            }),
            prisma_1.default.bodyMetric.count({ where }),
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
    static async getMetricById(metricId, userId, userRole) {
        const metric = await prisma_1.default.bodyMetric.findUnique({
            where: { id: metricId },
            include: {
                member: {
                    include: { user: true },
                },
            },
        });
        if (!metric) {
            throw new ApiError_1.AppError('Body metric not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && metric.member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own metrics', http_status_1.default.FORBIDDEN);
        }
        return metric;
    }
    static async updateBodyMetric(metricId, data, userId, userRole, updatedBy) {
        const existingMetric = await prisma_1.default.bodyMetric.findUnique({
            where: { id: metricId },
            include: { member: true },
        });
        if (!existingMetric) {
            throw new ApiError_1.AppError('Body metric not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER &&
            existingMetric.member.userId !== userId) {
            throw new ApiError_1.AppError('You can only update your own metrics', http_status_1.default.FORBIDDEN);
        }
        // Calculate BMI if weight is updated
        let calculatedBMI = data.bmi;
        if (data.weight && existingMetric.member.height && !data.bmi) {
            calculatedBMI = this.calculateBMI(data.weight, existingMetric.member.height);
        }
        const updatedMetric = await prisma_1.default.$transaction(async (tx) => {
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
    static async deleteBodyMetric(metricId, userId, userRole, deletedBy) {
        const existingMetric = await prisma_1.default.bodyMetric.findUnique({
            where: { id: metricId },
            include: { member: true },
        });
        if (!existingMetric) {
            throw new ApiError_1.AppError('Body metric not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER &&
            existingMetric.member.userId !== userId) {
            throw new ApiError_1.AppError('You can only delete your own metrics', http_status_1.default.FORBIDDEN);
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.bodyMetric.delete({
                where: { id: metricId },
            });
        });
        return { message: 'Body metric deleted successfully' };
    }
    static async getLatestMetric(memberId, userId, userRole) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own metrics', http_status_1.default.FORBIDDEN);
        }
        const latestMetric = await prisma_1.default.bodyMetric.findFirst({
            where: { memberId },
            orderBy: { recordDate: 'desc' },
        });
        return latestMetric;
    }
    // ============================================
    // PROGRESS PHOTOS OPERATIONS
    // ============================================
    static async uploadProgressPhoto(data, uploadedBy) {
        const { memberId, photoDate, imageUrl, photoType, notes } = data;
        // Verify member exists
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
            include: { user: true },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        const date = photoDate ? new Date(photoDate) : new Date();
        date.setHours(0, 0, 0, 0);
        const progressPhoto = await prisma_1.default.$transaction(async (tx) => {
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
    static async getMemberPhotos(memberId, filters, userId, userRole) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own photos', http_status_1.default.FORBIDDEN);
        }
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = { memberId };
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
            prisma_1.default.progressPhoto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { photoDate: 'desc' },
            }),
            prisma_1.default.progressPhoto.count({ where }),
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
    static async getPhotoById(photoId, userId, userRole) {
        const photo = await prisma_1.default.progressPhoto.findUnique({
            where: { id: photoId },
            include: {
                member: {
                    include: { user: true },
                },
            },
        });
        if (!photo) {
            throw new ApiError_1.AppError('Progress photo not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && photo.member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own photos', http_status_1.default.FORBIDDEN);
        }
        return photo;
    }
    static async deleteProgressPhoto(photoId, userId, userRole, deletedBy) {
        const existingPhoto = await prisma_1.default.progressPhoto.findUnique({
            where: { id: photoId },
            include: { member: true },
        });
        if (!existingPhoto) {
            throw new ApiError_1.AppError('Progress photo not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER &&
            existingPhoto.member.userId !== userId) {
            throw new ApiError_1.AppError('You can only delete your own photos', http_status_1.default.FORBIDDEN);
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.progressPhoto.delete({
                where: { id: photoId },
            });
        });
        return { message: 'Progress photo deleted successfully' };
    }
    // ============================================
    // ANALYTICS & COMPARISON
    // ============================================
    static async compareMetrics(memberId, startDate, endDate, userId, userRole) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own metrics', http_status_1.default.FORBIDDEN);
        }
        const startMetric = await prisma_1.default.bodyMetric.findFirst({
            where: {
                memberId,
                recordDate: { gte: new Date(startDate) },
            },
            orderBy: { recordDate: 'asc' },
        });
        const endMetric = await prisma_1.default.bodyMetric.findFirst({
            where: {
                memberId,
                recordDate: { lte: new Date(endDate) },
            },
            orderBy: { recordDate: 'desc' },
        });
        if (!startMetric || !endMetric) {
            throw new ApiError_1.AppError('Insufficient data for comparison', http_status_1.default.BAD_REQUEST);
        }
        const comparison = {
            period: {
                start: startMetric.recordDate,
                end: endMetric.recordDate,
                days: Math.ceil((endMetric.recordDate.getTime() - startMetric.recordDate.getTime()) /
                    (1000 * 60 * 60 * 24)),
            },
            weight: {
                start: startMetric.weight,
                end: endMetric.weight,
                change: endMetric.weight
                    ? (endMetric.weight || 0) - (startMetric.weight || 0)
                    : null,
                percentChange: this.calculatePercentChange(startMetric.weight, endMetric.weight),
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
                chest: this.getMeasurementComparison(startMetric.chest, endMetric.chest),
                waist: this.getMeasurementComparison(startMetric.waist, endMetric.waist),
                hips: this.getMeasurementComparison(startMetric.hips, endMetric.hips),
                biceps: this.getMeasurementComparison(startMetric.biceps, endMetric.biceps),
                thighs: this.getMeasurementComparison(startMetric.thighs, endMetric.thighs),
            },
        };
        return comparison;
    }
    static async getProgressSummary(memberId, userId, userRole) {
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Verify authorization
        if (userRole === client_1.Role.MEMBER && member.userId !== userId) {
            throw new ApiError_1.AppError('You can only view your own progress', http_status_1.default.FORBIDDEN);
        }
        const [totalMetrics, totalPhotos, latestMetric, firstMetric] = await Promise.all([
            prisma_1.default.bodyMetric.count({ where: { memberId } }),
            prisma_1.default.progressPhoto.count({ where: { memberId } }),
            prisma_1.default.bodyMetric.findFirst({
                where: { memberId },
                orderBy: { recordDate: 'desc' },
            }),
            prisma_1.default.bodyMetric.findFirst({
                where: { memberId },
                orderBy: { recordDate: 'asc' },
            }),
        ]);
        let overallProgress = null;
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
                        ? Math.ceil((latestMetric.recordDate.getTime() -
                            firstMetric.recordDate.getTime()) /
                            (1000 * 60 * 60 * 24))
                        : 0,
                }
                : null,
        };
    }
    // ============================================
    // HELPER METHODS
    // ============================================
    static calculateBMI(weight, height) {
        // Height is in cm, convert to meters
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return parseFloat(bmi.toFixed(2));
    }
    static calculatePercentChange(start, end) {
        if (!start || !end || start === 0)
            return null;
        const change = ((end - start) / start) * 100;
        return change.toFixed(2);
    }
    static getMeasurementComparison(start, end) {
        if (!start || !end)
            return null;
        return {
            start,
            end,
            change: parseFloat((end - start).toFixed(2)),
        };
    }
    static calculateBMIPublic(weight, height) {
        const bmi = this.calculateBMI(weight, height);
        let category = '';
        let recommendation = '';
        if (bmi < 18.5) {
            category = 'Underweight';
            recommendation = 'Consider consulting a nutritionist for a healthy weight gain plan';
        }
        else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal weight';
            recommendation = 'Maintain your healthy lifestyle';
        }
        else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            recommendation = 'Consider a balanced diet and regular exercise';
        }
        else {
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
exports.ProgressService = ProgressService;
