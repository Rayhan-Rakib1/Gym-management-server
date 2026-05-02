"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = exports.getUsersQuerySchema = exports.uploadAvatarSchema = exports.toggleUserStatusSchema = exports.updateUserRoleSchema = exports.updateUserProfileSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
exports.updateUserProfileSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: zod_1.default
            .string()
            .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number')
            .optional(),
        profileImage: zod_1.default.string().url('Invalid image URL').optional(),
    }),
});
exports.updateUserRoleSchema = zod_1.default.object({
    body: zod_1.default.object({
        role: zod_1.default.enum([client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.TRAINER, client_1.Role.MEMBER]),
    }),
});
exports.toggleUserStatusSchema = zod_1.default.object({
    body: zod_1.default.object({
        isActive: zod_1.default.boolean(),
    }),
});
exports.uploadAvatarSchema = zod_1.default.object({
    file: zod_1.default.object({
        mimetype: zod_1.default
            .string()
            .refine((val) => val.startsWith('image/'), 'File must be an image'),
        size: zod_1.default
            .number()
            .max(5 * 1024 * 1024, 'Image size must be less than 5MB'),
    }),
});
exports.getUsersQuerySchema = zod_1.default.object({
    query: zod_1.default.object({
        page: zod_1.default.string().optional().default('1'),
        limit: zod_1.default.string().optional().default('10'),
        search: zod_1.default.string().optional(),
        role: zod_1.default
            .enum([client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.TRAINER, client_1.Role.MEMBER])
            .optional(),
        isActive: zod_1.default
            .string()
            .transform((val) => val === 'true')
            .optional(),
        sortBy: zod_1.default.string().optional().default('createdAt'),
        order: zod_1.default.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
exports.userValidation = {
    updateUserProfileSchema: exports.updateUserProfileSchema,
    updateUserRoleSchema: exports.updateUserRoleSchema,
    toggleUserStatusSchema: exports.toggleUserStatusSchema,
    uploadAvatarSchema: exports.uploadAvatarSchema,
    getUsersQuerySchema: exports.getUsersQuerySchema,
};
