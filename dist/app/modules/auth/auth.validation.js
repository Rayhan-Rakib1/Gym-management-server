"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = exports.verifyEmailSchema = exports.refreshTokenSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        phone: zod_1.z
            .string()
            .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number').optional(),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    })
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        token: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    })
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    })
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    })
});
exports.verifyEmailSchema = zod_1.z.object({
    params: zod_1.z.object({
        token: zod_1.z.string(),
    }),
});
exports.authValidation = {
    registerSchema: exports.registerSchema,
    loginSchema: exports.loginSchema,
    forgotPasswordSchema: exports.forgotPasswordSchema,
    resetPasswordSchema: exports.resetPasswordSchema,
    changePasswordSchema: exports.changePasswordSchema,
    refreshTokenSchema: exports.refreshTokenSchema,
    verifyEmailSchema: exports.verifyEmailSchema,
};
