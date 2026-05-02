"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const sendEmail_1 = require("../../../utils/sendEmail");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    // Register user
    static async register(data) {
        const { name, email, password } = data;
        // Check if user already exists
        const existingUser = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { email }
                ],
            },
        });
        if (existingUser) {
            throw new ApiError_1.AppError('Email already registered', http_status_1.default.BAD_REQUEST);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, config_1.default.bcrypt_saltRounds);
        // Generate verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Create user with transaction
        const user = await prisma_1.default.$transaction(async (tx) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: client_1.Role.MEMBER
                },
            });
            // Create member profile
            const newMember = await tx.member.create({
                data: {
                    userId: newUser.id,
                    employeeId: `MEM-${Date.now()}`,
                },
            });
            return newMember;
        });
        // Send verification email
        const verificationUrl = `${config_1.default.frontend_url}/verify-email/${verificationToken}`;
        await (0, sendEmail_1.sendEmail)({
            to: email,
            subject: 'Verify Your Email - GymFlow Gym',
            html: `
        <h1>Welcome to GymFlow Gym!</h1>
        <p>Hi ${name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
        });
        return {
            message: 'Registration successful. Please check your email to verify your account.',
            userId: user.id,
        };
    }
    // Login user
    static async login(payload) {
        const { email, password } = payload;
        // Find user with relations
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: {
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
                    },
                },
                admin: true,
            },
        });
        if (!user) {
            throw new ApiError_1.AppError('Invalid email or password', http_status_1.default.UNAUTHORIZED);
        }
        // Check if user is active
        if (!user.isActive) {
            throw new ApiError_1.AppError('Your account has been deactivated. Please contact support.', http_status_1.default.FORBIDDEN);
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError_1.AppError('Invalid email or password', http_status_1.default.UNAUTHORIZED);
        }
        // Generate tokens
        const accessToken = (0, jwtHelpers_1.generateAccessToken)(user.id, user.role, user.email, user.name);
        const refreshToken = (0, jwtHelpers_1.generateRefreshToken)(user.id);
        // Update last login for admin
        // if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
        //   await prisma.admin.update({
        //     where: { userId: user.id },
        //     data: { lastLogin: new Date() },
        //   });
        // }
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    //  Refresh access token
    static async refreshToken(data) {
        const { refreshToken } = data;
        console.log('Received Refresh Token:', refreshToken);
        try {
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt.refresh_secret);
            // Find user
            const user = await prisma_1.default.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user || !user.isActive) {
                throw new ApiError_1.AppError('Invalid token', http_status_1.default.UNAUTHORIZED);
            }
            // Generate new access token
            const newAccessToken = (0, jwtHelpers_1.generateAccessToken)(user.id, user.role, user.email, user.name);
            return {
                accessToken: newAccessToken,
            };
        }
        catch (error) {
            throw new ApiError_1.AppError('Invalid or expired refresh token', http_status_1.default.UNAUTHORIZED);
        }
    }
    // Forgot password
    static async forgotPassword(data) {
        const { email } = data;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                message: 'Maybe your email is not registered with us. If it is, you will receive a password reset link if you check your email.',
            };
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        console.log('Generated Reset Token:', resetToken);
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        // Save reset token
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        // Send reset email
        const resetUrl = `${config_1.default.frontend_url}/reset-password/${resetToken}`;
        await (0, sendEmail_1.sendEmail)({
            to: email,
            subject: 'Password Reset Request - GymFlow Gym',
            html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
        return {
            message: `If your email is registered, you will receive a password reset link. ${resetToken}`,
        };
    }
    // Reset password
    static async resetPassword(token, data) {
        const { password } = data;
        // Find user by reset token
        const user = await prisma_1.default.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new ApiError_1.AppError('Invalid or expired reset token', http_status_1.default.BAD_REQUEST);
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Update password and clear reset token
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        // Send confirmation email
        await (0, sendEmail_1.sendEmail)({
            to: user.email,
            subject: 'Password Reset Successful - GymFlow Gym',
            html: `
        <h1>Password Reset Successful</h1>
        <p>Hi ${user.name},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `,
        });
        return {
            message: 'Password reset successful. You can now login with your new password.',
        };
    }
    // Verify email
    static async verifyEmail(token) {
        const user = await prisma_1.default.user.findFirst({
            where: {
                verificationToken: token,
            }
        });
        if (!user) {
            throw new ApiError_1.AppError('Invalid verification token', http_status_1.default.BAD_REQUEST);
        }
        if (user.isVerified) {
            throw new ApiError_1.AppError('Email already verified', http_status_1.default.BAD_REQUEST);
        }
        // Update user
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });
        // Send welcome email
        await (0, sendEmail_1.sendEmail)({
            to: user.email,
            subject: 'Welcome to PowerFit Gym!',
            html: `
        <h1>Welcome to PowerFit Gym!</h1>
        <p>Hi ${user.name},</p>
        <p>Your email has been verified successfully.</p>
        <p>You can now enjoy all the features of PowerFit Gym.</p>
        <a href="${config_1.default.frontend_url}/signin">Login Now</a>
      `,
        });
        return {
            message: 'Email verified successfully. You can now login.',
        };
    }
    // Resend verification email
    static async resendVerification(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        if (user.isVerified) {
            throw new ApiError_1.AppError('Email already verified', http_status_1.default.BAD_REQUEST);
        }
        // Generate new verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { verificationToken },
        });
        // Send verification email
        const verificationUrl = `${config_1.default.frontend_url}/verify-email/${verificationToken}`;
        await (0, sendEmail_1.sendEmail)({
            to: user.email,
            subject: 'Verify Your Email - PowerFit Gym',
            html: `
        <h1>Email Verification</h1>
        <p>Hi ${user.name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
        });
        return {
            message: 'Verification email sent. Please check your inbox.',
        };
    }
    // Get logged in user profile
    static async getMe(userId) {
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
    // Change password
    static async changePassword(userId, data) {
        const { currentPassword, newPassword } = data;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        // Verify current password
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new ApiError_1.AppError('Current password is incorrect', http_status_1.default.BAD_REQUEST);
        }
        // Check if new password is same as current
        const isSamePassword = await bcryptjs_1.default.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new ApiError_1.AppError('New password must be different from current password', http_status_1.default.BAD_REQUEST);
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        // Send confirmation email
        await (0, sendEmail_1.sendEmail)({
            to: user.email,
            subject: 'Password Changed - GymFlow Gym',
            html: `
        <h1>Password Changed</h1>
        <p>Hi ${user.name},</p>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `,
        });
        return {
            message: 'Password changed successfully',
        };
    }
}
exports.AuthService = AuthService;
