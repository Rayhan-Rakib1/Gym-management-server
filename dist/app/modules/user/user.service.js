"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const client_1 = require("@prisma/client");
class UserService {
    // Get all users with pagination and filters
    static async getAllUsers(query) {
        const { page = '1', limit = '10', search, role, isActive, sortBy = 'createdAt', order = 'desc', } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {};
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
        const total = await prisma_1.default.user.count({ where });
        // Get users
        const users = await prisma_1.default.user.findMany({
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
    static async getUserById(userId) {
        const user = await prisma_1.default.user.findUnique({
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
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        return user;
    }
    // Update user profile
    static async updateUserProfile(userId, data) {
        // Check if user exists
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        // Check if phone is already taken
        if (data.phone) {
            const existingUser = await prisma_1.default.user.findFirst({
                where: {
                    phone: data.phone,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                throw new ApiError_1.AppError('Phone number already in use', http_status_1.default.BAD_REQUEST);
            }
        }
        // Update user
        const updatedUser = await prisma_1.default.user.update({
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
    static async deleteUser(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        // Prevent deleting super admin
        if (user.role === client_1.Role.SUPER_ADMIN) {
            throw new ApiError_1.AppError('Cannot delete Super Admin', http_status_1.default.FORBIDDEN);
        }
        // Soft delete - deactivate user
        await prisma_1.default.user.update({
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
    static async toggleUserStatus(userId, data) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        // Prevent deactivating super admin
        if (user.role === client_1.Role.SUPER_ADMIN && !data.isActive) {
            throw new ApiError_1.AppError('Cannot deactivate Super Admin', http_status_1.default.FORBIDDEN);
        }
        const updatedUser = await prisma_1.default.user.update({
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
    static async updateUserRole(userId, data) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        // Prevent changing super admin role
        if (user.role === client_1.Role.SUPER_ADMIN) {
            throw new ApiError_1.AppError('Cannot change Super Admin role', http_status_1.default.FORBIDDEN);
        }
        const updatedUser = await prisma_1.default.user.update({
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
        const [totalUsers, activeUsers, totalMembers, activeMembers, totalTrainers, activeTrainers, totalAdmins,] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.user.count({ where: { isActive: true } }),
            prisma_1.default.user.count({ where: { role: client_1.Role.MEMBER } }),
            prisma_1.default.user.count({ where: { role: client_1.Role.MEMBER, isActive: true } }),
            prisma_1.default.user.count({ where: { role: client_1.Role.TRAINER } }),
            prisma_1.default.user.count({ where: { role: client_1.Role.TRAINER, isActive: true } }),
            prisma_1.default.user.count({ where: { role: client_1.Role.ADMIN } }),
        ]);
        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await prisma_1.default.user.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
        });
        // Get users by role
        const usersByRole = await prisma_1.default.user.groupBy({
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
    static async uploadAvatar(userId, imageUrl) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        const updatedUser = await prisma_1.default.user.update({
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
exports.UserService = UserService;
