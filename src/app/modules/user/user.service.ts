import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';
import { Role } from '@prisma/client';


export class UserService {
  
   // Get all users with pagination and filters
   
  static async getAllUsers(query) {
    const {
      page = '1',
      limit = '10',
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: order,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profileImage: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        // Include role-specific data
        member: {
          select: {
            employeeId: true,
            currentPlan: {
              select: {
                name: true,
              },
            },
          },
        },
        trainer: {
          select: {
            employeeId: true,
            rating: true,
          },
        },
        admin: {
          select: {
            accessLevel: true,
          },
        },
      },
    });

    return {
      users,
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

  // Get user by ID

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profileImage: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        member: {
          include: {
            currentPlan: true,
            assignedTrainer: {
              include: {
                user: {
                  select: {
                    name: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
        trainer: {
          include: {
            specializations: true,
            availability: true,
          },
        },
        admin: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    return user;
  }

   // Update user profile

  static async updateUserProfile(
    userId: string,
    data: any,
  ) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Check if phone is already taken
    if (data.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: data.phone,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new AppError('Phone number already in use', httpStatus.BAD_REQUEST);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profileImage: true,
        isActive: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
  
   // Delete user (Soft delete - deactivate)
  
  static async deleteUser(userId: string,) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Prevent deleting super admin
    if (user.role === Role.SUPER_ADMIN) {
      throw new AppError('Cannot delete Super Admin', httpStatus.FORBIDDEN);
    }

    // Soft delete - deactivate user
     await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(
    userId: string,
    data: any,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Prevent deactivating super admin
    if (user.role === Role.SUPER_ADMIN && !data.isActive) {
      throw new AppError('Cannot deactivate Super Admin', httpStatus.FORBIDDEN);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: data.isActive,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return updatedUser;
  }


// Update user role (Super Admin only)

  static async updateUserRole(
    userId: string,
    data: any,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Prevent changing super admin role
    if (user.role === Role.SUPER_ADMIN) {
      throw new AppError('Cannot change Super Admin role', httpStatus.FORBIDDEN);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: data.role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      totalMembers,
      activeMembers,
      totalTrainers,
      activeTrainers,
      totalAdmins,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: Role.MEMBER } }),
      prisma.user.count({ where: { role: Role.MEMBER, isActive: true } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.TRAINER, isActive: true } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
      },
      trainers: {
        total: totalTrainers,
        active: activeTrainers,
        inactive: totalTrainers - activeTrainers,
      },
      admins: totalAdmins,
      recentUsers,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
    };
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(
    userId: string,
    imageUrl: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: imageUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
      },
    });

    return updatedUser;
  }
}