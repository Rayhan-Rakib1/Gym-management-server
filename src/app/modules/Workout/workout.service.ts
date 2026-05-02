// src/modules/workoutPlan/workoutPlan.service.ts

import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';
import { Role, DayOfWeek } from '@prisma/client';

interface IUser {
  id: string;
  role: Role;
  email: string;
}

interface ICreateWorkoutPlan {
  memberId: string;
  trainerId?: string;
  planName: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  goals?: string[];
  notes?: string | null;
  exercises?: any[];
}

interface IUpdateWorkoutPlan {
  planName?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  goals?: string[];
  notes?: string | null;
  isActive?: boolean;
}

interface IExercise {
  dayOfWeek: DayOfWeek;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number | null;
  restTime?: number | null;
  videoUrl?: string | null;
  instructions?: string | null;
  orderIndex?: number;
}

interface IDietPlan {
  breakfast?: string | null;
  midMorning?: string | null;
  lunch?: string | null;
  evening?: string | null;
  dinner?: string | null;
  totalCalories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatsGrams?: number | null;
  waterIntake?: string | null;
  supplements?: string | null;
  notes?: string | null;
}

export class WorkoutPlanService {
  /**
   * Create workout plan
   */
  static async createWorkoutPlan(data: ICreateWorkoutPlan, user: IUser) {
    const { memberId, planName, description, startDate, endDate, goals, notes, exercises } = data;

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new AppError('Member not found', httpStatus.NOT_FOUND);
    }

    // Get trainer ID
    let trainerId: string;
    if (user.role === Role.TRAINER) {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: user.id },
      });
      if (!trainer) {
        throw new AppError('Trainer profile not found', httpStatus.NOT_FOUND);
      }
      trainerId = trainer.id;
    } else if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      // Admin must provide trainerId
      if (!data.trainerId) {
        throw new AppError('Trainer ID is required for admin', httpStatus.BAD_REQUEST);
      }
      trainerId = data.trainerId;
    } else {
      throw new AppError('Unauthorized to create workout plan', httpStatus.FORBIDDEN);
    }

    // Create workout plan with exercises
    const workoutPlan = await prisma.workoutPlan.create({
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
  static async getAllWorkoutPlans(query: any) {
    const { page = '1', limit = '10', isActive, trainerId, memberId } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (trainerId) where.trainerId = trainerId;
    if (memberId) where.memberId = memberId;

    const [workoutPlans, total] = await Promise.all([
      prisma.workoutPlan.findMany({
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
      prisma.workoutPlan.count({ where }),
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
  static async getWorkoutPlanById(id: string, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
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
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'view');

    return workoutPlan;
  }

  /**
   * Update workout plan
   */
  static async updateWorkoutPlan(id: string, data: IUpdateWorkoutPlan, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');

    const updated = await prisma.workoutPlan.update({
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
  static async deleteWorkoutPlan(id: string, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'delete');

    await prisma.workoutPlan.delete({
      where: { id },
    });

    return { message: 'Workout plan deleted successfully' };
  }

  /**
   * Get member's workout plans
   */
  static async getMemberWorkoutPlans(memberId: string, query: any, user: IUser) {
    const { page = '1', limit = '10', isActive } = query;

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new AppError('Member not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    if (user.role === Role.MEMBER) {
      const userMember = await prisma.member.findUnique({
        where: { userId: user.id },
      });
      if (!userMember || userMember.id !== memberId) {
        throw new AppError('Access denied', httpStatus.FORBIDDEN);
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { memberId };
    if (isActive !== undefined) where.isActive = isActive;

    const [workoutPlans, total] = await Promise.all([
      prisma.workoutPlan.findMany({
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
      prisma.workoutPlan.count({ where }),
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
  static async getTrainerWorkoutPlans(trainerId: string, query: any, user: IUser) {
    const { page = '1', limit = '10', isActive } = query;

    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    if (user.role === Role.TRAINER) {
      const userTrainer = await prisma.trainer.findUnique({
        where: { userId: user.id },
      });
      if (!userTrainer || userTrainer.id !== trainerId) {
        throw new AppError('Access denied', httpStatus.FORBIDDEN);
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { trainerId };
    if (isActive !== undefined) where.isActive = isActive;

    const [workoutPlans, total] = await Promise.all([
      prisma.workoutPlan.findMany({
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
      prisma.workoutPlan.count({ where }),
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
  static async addExercise(workoutPlanId: string, data: IExercise, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');

    const exercise = await prisma.exercise.create({
      data: {
        workoutPlanId,
        ...(data as any),
      },
    });

    return exercise;
  }

  /**
   * Update exercise
   */
  static async updateExercise(
    workoutPlanId: string,
    exerciseId: string,
    data: Partial<IExercise>,
    user: IUser
  ) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise || exercise.workoutPlanId !== workoutPlanId) {
      throw new AppError('Exercise not found in this workout plan', httpStatus.NOT_FOUND);
    }

    const updated = await prisma.exercise.update({
      where: { id: exerciseId },
      data: data as any,
    });

    return updated;
  }

  /**
   * Delete exercise
   */
  static async deleteExercise(workoutPlanId: string, exerciseId: string, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise || exercise.workoutPlanId !== workoutPlanId) {
      throw new AppError('Exercise not found in this workout plan', httpStatus.NOT_FOUND);
    }

    await prisma.exercise.delete({
      where: { id: exerciseId },
    });

    return { message: 'Exercise deleted successfully' };
  }

  /**
   * Add or Update diet plan
   */
  static async addOrUpdateDietPlan(workoutPlanId: string, data: IDietPlan, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');

    // Check if diet plan already exists
    const existingDietPlan = await prisma.dietPlan.findUnique({
      where: { workoutPlanId },
    });

    let dietPlan;
    if (existingDietPlan) {
      // Update existing
      dietPlan = await prisma.dietPlan.update({
        where: { workoutPlanId },
        data,
      });
    } else {
      // Create new
      dietPlan = await prisma.dietPlan.create({
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
  static async getDietPlan(workoutPlanId: string, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'view');

    const dietPlan = await prisma.dietPlan.findUnique({
      where: { workoutPlanId },
    });

    if (!dietPlan) {
      throw new AppError('Diet plan not found', httpStatus.NOT_FOUND);
    }

    return dietPlan;
  }

  /**
   * Toggle workout plan status
   */
  static async toggleWorkoutPlanStatus(id: string, user: IUser) {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!workoutPlan) {
      throw new AppError('Workout plan not found', httpStatus.NOT_FOUND);
    }

    // Authorization check
    await this.checkWorkoutPlanAccess(workoutPlan, user, 'edit');

    const updated = await prisma.workoutPlan.update({
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
  private static async checkWorkoutPlanAccess(
    workoutPlan: any,
    user: IUser,
    action: 'view' | 'edit' | 'delete'
  ) {
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      return true; // Admin has full access
    }

    if (user.role === Role.TRAINER) {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: user.id },
      });
      if (trainer && trainer.id === workoutPlan.trainerId) {
        return true; // Trainer can access their own plans
      }
    }

    if (user.role === Role.MEMBER && action === 'view') {
      const member = await prisma.member.findUnique({
        where: { userId: user.id },
      });
      if (member && member.id === workoutPlan.memberId) {
        return true; // Member can view their own plans
      }
    }

    throw new AppError('Access denied', httpStatus.FORBIDDEN);
  }
}