import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';
import httpStatus from 'http-status';
import { IUser } from '../../interfaces';
import config from '../../../config';
import { sendEmail } from '../../../utils/sendEmail';
import { generateAccessToken, generateRefreshToken } from '../../../helpers/jwtHelpers';
import jwt from 'jsonwebtoken';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export class AuthService {

  // Register user
  static async register(data: RegisterData) {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email }
        ],
      },
    });

    if (existingUser) {
      throw new AppError('Email already registered', httpStatus.BAD_REQUEST);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcrypt_saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user with transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.MEMBER
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
    const verificationUrl = `${config.frontend_url}/verify-email/${verificationToken}`;
    await sendEmail({
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

  static async login(payload: { email: string; password: string; }) {
    const { email, password } = payload;

    // Find user with relations
    const user = await prisma.user.findUnique({
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
      throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', httpStatus.FORBIDDEN);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role, user.email, user.name);
    const refreshToken = generateRefreshToken(user.id);

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

  static async refreshToken(data: { refreshToken: string; }) {
    const { refreshToken } = data;
    console.log('Received Refresh Token:', refreshToken);
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refresh_secret!
      ) as { userId: string };

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid token', httpStatus.UNAUTHORIZED);
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user.id, user.role, user.email, user.name);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', httpStatus.UNAUTHORIZED);
    }
  }

  // Forgot password

  static async forgotPassword(data: { email: string; }) {
    const { email } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: 'Maybe your email is not registered with us. If it is, you will receive a password reset link if you check your email.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated Reset Token:', resetToken);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const resetUrl = `${config.frontend_url}/reset-password/${resetToken}`;
    await sendEmail({
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

  static async resetPassword(token: string, data: { password: string; }) {
    const { password } = data;

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', httpStatus.BAD_REQUEST);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Send confirmation email
    await sendEmail({
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

  static async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      }
    });

    if (!user) {
      throw new AppError('Invalid verification token', httpStatus.BAD_REQUEST);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', httpStatus.BAD_REQUEST);
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to PowerFit Gym!',
      html: `
        <h1>Welcome to PowerFit Gym!</h1>
        <p>Hi ${user.name},</p>
        <p>Your email has been verified successfully.</p>
        <p>You can now enjoy all the features of PowerFit Gym.</p>
        <a href="${config.frontend_url}/signin">Login Now</a>
      `,
    });

    return {
      message: 'Email verified successfully. You can now login.',
    };
  }

  // Resend verification email

  static async resendVerification(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', httpStatus.BAD_REQUEST);
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Send verification email
    const verificationUrl = `${config.frontend_url}/verify-email/${verificationToken}`;
    await sendEmail({
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
  static async getMe(userId: string) {
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

  // Change password

  static async changePassword(userId: string, data: { currentPassword: string; newPassword: string; }) {
    const { currentPassword, newPassword } = data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', httpStatus.BAD_REQUEST);
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError('New password must be different from current password', httpStatus.BAD_REQUEST);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send confirmation email
    await sendEmail({
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