"use strict";
// src/modules/workoutPlan/workoutPlan.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const client_1 = require("@prisma/client");
class WorkoutPlanService {
    /**
     * Create workout plan
     */
    static async createWorkoutPlan(data, user) {
        const { memberId, planName, description, startDate, endDate, goals, notes, exercises } = data;
        // Verify member exists
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
            include: { user: true },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Get trainer ID
        let trainerId;
        if (user.role === client_1.Role.TRAINER) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { userId: user.id },
            });
            if (!trainer) {
                throw new ApiError_1.AppError('Trainer profile not found', http_status_1.default.NOT_FOUND);
            }
            trainerId = trainer.id;
        }
        else if (user.role === client_1.Role.ADMIN || user.role === client_1.Role.SUPER_ADMIN) {
            // Admin must provide trainerId
            if (!data.trainerId) {
                throw new ApiError_1.AppError('Trainer ID is required for admin', http_status_1.default.BAD_REQUEST);
            }
            trainerId = data.trainerId;
        }
        else {
            throw new ApiError_1.AppError('Unauthorized to create workout plan', http_status_1.default.FORBIDDEN);
        }
        // Create workout plan with exercises
        const workoutPlan = await prisma_1.default.workoutPlan.create({
            data: {
                memberId,
                trainerId,
                planName,
                description,
                startDate,
                endDate,
                goals: goals || [],
                notes,
                exercises: {
                    create: exercises || [],
                },
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
                trainer: {
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
                exercises: {
                    orderBy: { orderIndex: 'asc' },
                },
                dietPlan: true,
            },
        });
        return workoutPlan;
    }
    /**
     * Get all workout plans (Admin only)
     */
    static async getAllWorkoutPlans(query) {
        const { page = '1', limit = '10', isActive, trainerId, memberId } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (isActive !== undefined)
            where.isActive = isActive;
        if (trainerId)
            where.trainerId = trainerId;
        if (memberId)
            where.memberId = memberId;
        const [workoutPlans, total] = await Promise.all([
            prisma_1.default.workoutPlan.findMany({
                where,
                skip,
                take: limitNum,
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
                    trainer: {
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
                    exercises: {
                        orderBy: { orderIndex: 'asc' },
                    },
                    dietPlan: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.workoutPlan.count({ where }),
        ]);
        return {
            workoutPlans,
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
     * Get workout plan by ID
     */
    static async getWorkoutPlanById(id, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id },
            include: {
                member: {
                    include: { user: true },
                },
                trainer: {
                    include: { user: true },
                },
                exercises: {
                    orderBy: { orderIndex: 'asc' },
                },
                dietPlan: true,
            },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'view');
        return workoutPlan;
    }
    /**
     * Update workout plan
     */
    static async updateWorkoutPlan(id, data, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');
        const updated = await prisma_1.default.workoutPlan.update({
            where: { id },
            data: {
                ...(data.planName && { planName: data.planName }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.startDate && { startDate: data.startDate }),
                ...(data.endDate && { endDate: data.endDate }),
                ...(data.goals && { goals: data.goals }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
            include: {
                member: {
                    include: { user: true },
                },
                trainer: {
                    include: { user: true },
                },
                exercises: {
                    orderBy: { orderIndex: 'asc' },
                },
                dietPlan: true,
            },
        });
        return updated;
    }
    /**
     * Delete workout plan
     */
    static async deleteWorkoutPlan(id, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'delete');
        await prisma_1.default.workoutPlan.delete({
            where: { id },
        });
        return { message: 'Workout plan deleted successfully' };
    }
    /**
     * Get member's workout plans
     */
    static async getMemberWorkoutPlans(memberId, query, user) {
        const { page = '1', limit = '10', isActive } = query;
        // Verify member exists
        const member = await prisma_1.default.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new ApiError_1.AppError('Member not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        if (user.role === client_1.Role.MEMBER) {
            const userMember = await prisma_1.default.member.findUnique({
                where: { userId: user.id },
            });
            if (!userMember || userMember.id !== memberId) {
                throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
            }
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { memberId };
        if (isActive !== undefined)
            where.isActive = isActive;
        const [workoutPlans, total] = await Promise.all([
            prisma_1.default.workoutPlan.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    trainer: {
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
                    exercises: {
                        orderBy: { orderIndex: 'asc' },
                    },
                    dietPlan: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.workoutPlan.count({ where }),
        ]);
        return {
            workoutPlans,
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
     * Get trainer's workout plans
     */
    static async getTrainerWorkoutPlans(trainerId, query, user) {
        const { page = '1', limit = '10', isActive } = query;
        // Verify trainer exists
        const trainer = await prisma_1.default.trainer.findUnique({
            where: { id: trainerId },
        });
        if (!trainer) {
            throw new ApiError_1.AppError('Trainer not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        if (user.role === client_1.Role.TRAINER) {
            const userTrainer = await prisma_1.default.trainer.findUnique({
                where: { userId: user.id },
            });
            if (!userTrainer || userTrainer.id !== trainerId) {
                throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
            }
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { trainerId };
        if (isActive !== undefined)
            where.isActive = isActive;
        const [workoutPlans, total] = await Promise.all([
            prisma_1.default.workoutPlan.findMany({
                where,
                skip,
                take: limitNum,
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
                    exercises: {
                        orderBy: { orderIndex: 'asc' },
                    },
                    dietPlan: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.workoutPlan.count({ where }),
        ]);
        return {
            workoutPlans,
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
     * Add exercise to plan
     */
    static async addExercise(workoutPlanId, data, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id: workoutPlanId },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');
        const exercise = await prisma_1.default.exercise.create({
            data: {
                workoutPlanId,
                ...data,
            },
        });
        return exercise;
    }
    /**
     * Update exercise
     */
    static async updateExercise(workoutPlanId, exerciseId, data, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id: workoutPlanId },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');
        const exercise = await prisma_1.default.exercise.findUnique({
            where: { id: exerciseId },
        });
        if (!exercise || exercise.workoutPlanId !== workoutPlanId) {
            throw new ApiError_1.AppError('Exercise not found in this workout plan', http_status_1.default.NOT_FOUND);
        }
        const updated = await prisma_1.default.exercise.update({
            where: { id: exerciseId },
            data: data,
        });
        return updated;
    }
    /**
     * Delete exercise
     */
    static async deleteExercise(workoutPlanId, exerciseId, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id: workoutPlanId },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');
        const exercise = await prisma_1.default.exercise.findUnique({
            where: { id: exerciseId },
        });
        if (!exercise || exercise.workoutPlanId !== workoutPlanId) {
            throw new ApiError_1.AppError('Exercise not found in this workout plan', http_status_1.default.NOT_FOUND);
        }
        await prisma_1.default.exercise.delete({
            where: { id: exerciseId },
        });
        return { message: 'Exercise deleted successfully' };
    }
    /**
     * Add or Update diet plan
     */
    static async addOrUpdateDietPlan(workoutPlanId, data, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id: workoutPlanId },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');
        // Check if diet plan already exists
        const existingDietPlan = await prisma_1.default.dietPlan.findUnique({
            where: { workoutPlanId },
        });
        let dietPlan;
        if (existingDietPlan) {
            // Update existing
            dietPlan = await prisma_1.default.dietPlan.update({
                where: { workoutPlanId },
                data,
            });
        }
        else {
            // Create new
            dietPlan = await prisma_1.default.dietPlan.create({
                data: {
                    workoutPlanId,
                    ...data,
                },
            });
        }
        return dietPlan;
    }
    /**
     * Get diet plan
     */
    static async getDietPlan(workoutPlanId, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id: workoutPlanId },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'view');
        const dietPlan = await prisma_1.default.dietPlan.findUnique({
            where: { workoutPlanId },
        });
        if (!dietPlan) {
            throw new ApiError_1.AppError('Diet plan not found', http_status_1.default.NOT_FOUND);
        }
        return dietPlan;
    }
    /**
     * Toggle workout plan status
     */
    static async toggleWorkoutPlanStatus(id, user) {
        const workoutPlan = await prisma_1.default.workoutPlan.findUnique({
            where: { id },
        });
        if (!workoutPlan) {
            throw new ApiError_1.AppError('Workout plan not found', http_status_1.default.NOT_FOUND);
        }
        // Authorization check
        await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');
        const updated = await prisma_1.default.workoutPlan.update({
            where: { id },
            data: {
                isActive: !workoutPlan.isActive,
            },
            include: {
                member: {
                    include: { user: true },
                },
                trainer: {
                    include: { user: true },
                },
                exercises: true,
                dietPlan: true,
            },
        });
        return updated;
    }
    /**
     * Helper: Check workout plan access
     */
    static async checkWorkoutPlanAccess(workoutPlan, user, action) {
        if (user.role === client_1.Role.ADMIN || user.role === client_1.Role.SUPER_ADMIN) {
            return true; // Admin has full access
        }
        if (user.role === client_1.Role.TRAINER) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { userId: user.id },
            });
            if (trainer && trainer.id === workoutPlan.trainerId) {
                return true; // Trainer can access their own plans
            }
        }
        if (user.role === client_1.Role.MEMBER && action === 'view') {
            const member = await prisma_1.default.member.findUnique({
                where: { userId: user.id },
            });
            if (member && member.id === workoutPlan.memberId) {
                return true; // Member can view their own plans
            }
        }
        throw new ApiError_1.AppError('Access denied', http_status_1.default.FORBIDDEN);
    }
}
exports.WorkoutPlanService = WorkoutPlanService;
