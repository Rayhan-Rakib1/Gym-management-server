"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsByCategorySchema = exports.importSettingsSchema = exports.resetSettingsSchema = exports.bulkUpdateSettingsSchema = exports.getAllSettingsQuerySchema = exports.deleteSettingSchema = exports.getSettingByKeySchema = exports.updateSettingSchema = exports.createSettingSchema = void 0;
const zod_1 = require("zod");
/**
 * Create setting validation
 */
exports.createSettingSchema = zod_1.z.object({
    body: zod_1.z.object({
        key: zod_1.z
            .string()
            .min(2, 'Key must be at least 2 characters')
            .max(100, 'Key cannot exceed 100 characters')
            .regex(/^[a-z0-9_]+$/, 'Key must be lowercase letters, numbers, and underscores only'),
        value: zod_1.z.string().min(1, 'Value is required'),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot exceed 500 characters')
            .optional()
            .nullable(),
    }),
});
/**
 * Update setting validation
 */
exports.updateSettingSchema = zod_1.z.object({
    params: zod_1.z.object({
        key: zod_1.z.string().min(1, 'Setting key is required'),
    }),
    body: zod_1.z.object({
        value: zod_1.z.string().min(1, 'Value is required'),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot exceed 500 characters')
            .optional()
            .nullable(),
    }),
});
/**
 * Get setting by key validation
 */
exports.getSettingByKeySchema = zod_1.z.object({
    params: zod_1.z.object({
        key: zod_1.z.string().min(1, 'Setting key is required'),
    }),
});
/**
 * Delete setting validation
 */
exports.deleteSettingSchema = zod_1.z.object({
    params: zod_1.z.object({
        key: zod_1.z.string().min(1, 'Setting key is required'),
    }),
});
/**
 * Get all settings query validation
 */
exports.getAllSettingsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('50'),
        search: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
    }),
});
/**
 * Bulk update settings validation
 */
exports.bulkUpdateSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        settings: zod_1.z
            .array(zod_1.z.object({
            key: zod_1.z.string().min(1, 'Key is required'),
            value: zod_1.z.string().min(1, 'Value is required'),
        }))
            .min(1, 'At least one setting is required')
            .max(50, 'Cannot update more than 50 settings at once'),
    }),
});
/**
 * Reset settings validation
 */
exports.resetSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        category: zod_1.z
            .string()
            .optional()
            .nullable(),
        confirm: zod_1.z
            .boolean()
            .refine((val) => val === true, {
            message: 'Confirmation is required to reset settings',
        }),
    }),
});
/**
 * Import settings validation
 */
exports.importSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        settings: zod_1.z
            .array(zod_1.z.object({
            key: zod_1.z.string().min(1),
            value: zod_1.z.string().min(1),
            description: zod_1.z.string().optional().nullable(),
        }))
            .min(1, 'At least one setting is required'),
        overwrite: zod_1.z.boolean().optional().default(false),
    }),
});
/**
 * Get settings by category validation
 */
exports.getSettingsByCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        category: zod_1.z.string().min(1, 'Category is required'),
    }),
});
