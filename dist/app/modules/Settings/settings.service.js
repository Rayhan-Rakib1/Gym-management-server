"use strict";
// src/modules/settings/settings.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = require("../../errors/ApiError");
// Default system settings
const DEFAULT_SETTINGS = {
    // General
    gym_name: 'GymFlow Fitness Center',
    gym_email: 'info@gymflow.com',
    gym_phone: '+880 1712-345678',
    gym_address: 'Dhaka, Bangladesh',
    gym_timezone: 'Asia/Dhaka',
    gym_currency: 'BDT',
    // Business Hours
    opening_time: '06:00',
    closing_time: '22:00',
    working_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    // Membership
    membership_grace_period_days: '7',
    membership_expiry_reminder_days: '7',
    allow_membership_freeze: 'true',
    max_freeze_days_per_year: '30',
    // Attendance
    allow_early_checkin_minutes: '15',
    auto_checkout_hours: '4',
    require_checkout: 'false',
    // Reviews
    allow_unverified_reviews: 'true',
    require_trainer_assignment_for_review: 'true',
    min_review_length: '10',
    max_review_length: '1000',
    // Notifications
    enable_email_notifications: 'true',
    enable_sms_notifications: 'false',
    enable_push_notifications: 'true',
    // Security
    session_timeout_minutes: '60',
    max_login_attempts: '5',
    password_min_length: '8',
    require_strong_password: 'true',
    // Features
    enable_ai_trainer_recommendation: 'true',
    enable_online_booking: 'true',
    enable_payment_gateway: 'true',
    enable_member_portal: 'true',
    // Limits
    max_members_per_trainer: '20',
    max_classes_per_day: '10',
    max_booking_advance_days: '30',
};
class SettingsService {
    /**
     * Get all settings
     */
    static async getAllSettings(query) {
        const { page = '1', limit = '50', search, category } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { key: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.key = {
                startsWith: `${category}_`,
            };
        }
        const [settings, total] = await Promise.all([
            prisma_1.default.systemSettings.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { key: 'asc' },
            }),
            prisma_1.default.systemSettings.count({ where }),
        ]);
        return {
            settings,
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
     * Get setting by key
     */
    static async getSettingByKey(key) {
        const setting = await prisma_1.default.systemSettings.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new ApiError_1.AppError('Setting not found', http_status_1.default.NOT_FOUND);
        }
        return setting;
    }
    /**
     * Create setting
     */
    static async createSetting(data, user) {
        const { key, value, description } = data;
        // Check if setting already exists
        const existingSetting = await prisma_1.default.systemSettings.findUnique({
            where: { key },
        });
        if (existingSetting) {
            throw new ApiError_1.AppError('Setting with this key already exists', http_status_1.default.BAD_REQUEST);
        }
        const setting = await prisma_1.default.systemSettings.create({
            data: {
                key,
                value,
                description,
            },
        });
        return setting;
    }
    /**
     * Update setting
     */
    static async updateSetting(key, data, user) {
        const setting = await prisma_1.default.systemSettings.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new ApiError_1.AppError('Setting not found', http_status_1.default.NOT_FOUND);
        }
        const updated = await prisma_1.default.systemSettings.update({
            where: { key },
            data: {
                value: data.value,
                ...(data.description !== undefined && { description: data.description }),
            },
        });
        return updated;
    }
    /**
     * Delete setting
     */
    static async deleteSetting(key, user) {
        const setting = await prisma_1.default.systemSettings.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new ApiError_1.AppError('Setting not found', http_status_1.default.NOT_FOUND);
        }
        await prisma_1.default.systemSettings.delete({
            where: { key },
        });
        return { message: 'Setting deleted successfully' };
    }
    /**
     * Get public settings (for frontend without authentication)
     */
    static async getPublicSettings() {
        const publicKeys = [
            'gym_name',
            'gym_email',
            'gym_phone',
            'gym_address',
            'opening_time',
            'closing_time',
            'working_days',
            'enable_online_booking',
            'enable_member_portal',
        ];
        const settings = await prisma_1.default.systemSettings.findMany({
            where: {
                key: {
                    in: publicKeys,
                },
            },
        });
        // Convert array to object
        const settingsObject = {};
        settings.forEach((setting) => {
            settingsObject[setting.key] = setting.value;
        });
        return settingsObject;
    }
    /**
     * Get settings by category
     */
    static async getSettingsByCategory(category) {
        const settings = await prisma_1.default.systemSettings.findMany({
            where: {
                key: {
                    startsWith: `${category}_`,
                },
            },
            orderBy: { key: 'asc' },
        });
        if (settings.length === 0) {
            throw new ApiError_1.AppError('No settings found for this category', http_status_1.default.NOT_FOUND);
        }
        return settings;
    }
    /**
     * Bulk update settings
     */
    static async bulkUpdateSettings(settings, user) {
        const results = {
            updated: [],
            created: [],
            failed: [],
        };
        await prisma_1.default.$transaction(async (tx) => {
            for (const setting of settings) {
                try {
                    const existing = await tx.systemSettings.findUnique({
                        where: { key: setting.key },
                    });
                    if (existing) {
                        await tx.systemSettings.update({
                            where: { key: setting.key },
                            data: { value: setting.value },
                        });
                        results.updated.push(setting.key);
                    }
                    else {
                        await tx.systemSettings.create({
                            data: {
                                key: setting.key,
                                value: setting.value,
                            },
                        });
                        results.created.push(setting.key);
                    }
                }
                catch (error) {
                    results.failed.push({
                        key: setting.key,
                        reason: 'Update failed',
                    });
                }
            }
        });
        return results;
    }
    /**
     * Reset settings to default
     */
    static async resetSettings(category, user) {
        let settingsToReset = {};
        if (category) {
            // Reset specific category
            Object.keys(DEFAULT_SETTINGS).forEach((key) => {
                if (key.startsWith(`${category}_`)) {
                    settingsToReset[key] = DEFAULT_SETTINGS[key];
                }
            });
            if (Object.keys(settingsToReset).length === 0) {
                throw new ApiError_1.AppError('Invalid category', http_status_1.default.BAD_REQUEST);
            }
        }
        else {
            // Reset all settings
            settingsToReset = DEFAULT_SETTINGS;
        }
        await prisma_1.default.$transaction(async (tx) => {
            for (const [key, value] of Object.entries(settingsToReset)) {
                await tx.systemSettings.upsert({
                    where: { key },
                    update: { value },
                    create: {
                        key,
                        value,
                        description: `Default ${key.replace(/_/g, ' ')} setting`,
                    },
                });
            }
        });
        return {
            message: category
                ? `Settings in category '${category}' reset to default`
                : 'All settings reset to default',
            count: Object.keys(settingsToReset).length,
        };
    }
    /**
     * Initialize default settings
     */
    static async initializeDefaultSettings() {
        const existingCount = await prisma_1.default.systemSettings.count();
        if (existingCount > 0) {
            return {
                message: 'Settings already initialized',
                count: existingCount,
            };
        }
        await prisma_1.default.$transaction(async (tx) => {
            for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
                await tx.systemSettings.create({
                    data: {
                        key,
                        value,
                        description: `Default ${key.replace(/_/g, ' ')} setting`,
                    },
                });
            }
        });
        return {
            message: 'Default settings initialized successfully',
            count: Object.keys(DEFAULT_SETTINGS).length,
        };
    }
    /**
     * Import settings
     */
    static async importSettings(settings, overwrite, user) {
        const results = {
            imported: [],
            skipped: [],
            failed: [],
        };
        await prisma_1.default.$transaction(async (tx) => {
            for (const setting of settings) {
                try {
                    const existing = await tx.systemSettings.findUnique({
                        where: { key: setting.key },
                    });
                    if (existing && !overwrite) {
                        results.skipped.push(setting.key);
                        continue;
                    }
                    if (existing && overwrite) {
                        await tx.systemSettings.update({
                            where: { key: setting.key },
                            data: {
                                value: setting.value,
                                description: setting.description,
                            },
                        });
                    }
                    else {
                        await tx.systemSettings.create({
                            data: {
                                key: setting.key,
                                value: setting.value,
                                description: setting.description,
                            },
                        });
                    }
                    results.imported.push(setting.key);
                }
                catch (error) {
                    results.failed.push({
                        key: setting.key,
                        reason: 'Import failed',
                    });
                }
            }
        });
        return results;
    }
    /**
     * Export all settings
     */
    static async exportSettings() {
        const settings = await prisma_1.default.systemSettings.findMany({
            orderBy: { key: 'asc' },
        });
        return settings;
    }
    /**
     * Get settings categories
     */
    static async getCategories() {
        const settings = await prisma_1.default.systemSettings.findMany({
            select: { key: true },
        });
        const categories = new Set();
        settings.forEach((setting) => {
            const category = setting.key.split('_')[0];
            if (category) {
                categories.add(category);
            }
        });
        return Array.from(categories).sort();
    }
    /**
     * Validate setting value
     */
    static validateSettingValue(key, value) {
        // Add validation rules for specific settings
        const validators = {
            gym_email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            gym_phone: (val) => /^[+]?[\d\s-()]+$/.test(val),
            opening_time: (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val),
            closing_time: (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val),
            enable_email_notifications: (val) => val === 'true' || val === 'false',
            enable_sms_notifications: (val) => val === 'true' || val === 'false',
            enable_push_notifications: (val) => val === 'true' || val === 'false',
            max_login_attempts: (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
            session_timeout_minutes: (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
            password_min_length: (val) => !isNaN(parseInt(val)) && parseInt(val) >= 6 && parseInt(val) <= 32,
        };
        const validator = validators[key];
        if (validator) {
            return validator(value);
        }
        return true; // No specific validation
    }
    /**
     * Get setting value with default fallback
     */
    static async getSettingValue(key, defaultValue) {
        try {
            const setting = await prisma_1.default.systemSettings.findUnique({
                where: { key },
            });
            if (!setting) {
                return defaultValue || DEFAULT_SETTINGS[key] || '';
            }
            return setting.value;
        }
        catch (error) {
            return defaultValue || '';
        }
    }
}
exports.SettingsService = SettingsService;
