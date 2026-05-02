"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const settings_service_1 = require("./settings.service");
const sendResponse_1 = require("../../../utils/sendResponse");
class SettingsController {
}
exports.SettingsController = SettingsController;
_a = SettingsController;
/**
 * Get all settings
 */
SettingsController.getAllSettings = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await settings_service_1.SettingsService.getAllSettings(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Settings retrieved successfully',
        data: result.settings,
        meta: result.pagination,
    });
});
/**
 * Get setting by key
 */
SettingsController.getSettingByKey = (0, catchAsync_1.default)(async (req, res, next) => {
    const { key } = req.params;
    const setting = await settings_service_1.SettingsService.getSettingByKey(key);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Setting retrieved successfully',
        data: setting,
    });
});
/**
 * Create setting
 */
SettingsController.createSetting = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = req.user;
    const setting = await settings_service_1.SettingsService.createSetting(req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Setting created successfully',
        data: setting,
    });
});
/**
 * Update setting
 */
SettingsController.updateSetting = (0, catchAsync_1.default)(async (req, res, next) => {
    const { key } = req.params;
    const user = req.user;
    // Validate setting value
    const isValid = settings_service_1.SettingsService.validateSettingValue(key, req.body.value);
    if (!isValid) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: 'Invalid setting value',
            data: null,
        });
        return;
    }
    const setting = await settings_service_1.SettingsService.updateSetting(key, req.body, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Setting updated successfully',
        data: setting,
    });
});
/**
 * Delete setting
 */
SettingsController.deleteSetting = (0, catchAsync_1.default)(async (req, res, next) => {
    const { key } = req.params;
    const user = req.user;
    const result = await settings_service_1.SettingsService.deleteSetting(key, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
/**
 * Get public settings
 */
SettingsController.getPublicSettings = (0, catchAsync_1.default)(async (req, res, next) => {
    const settings = await settings_service_1.SettingsService.getPublicSettings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Public settings retrieved successfully',
        data: settings,
    });
});
/**
 * Get settings by category
 */
SettingsController.getSettingsByCategory = (0, catchAsync_1.default)(async (req, res, next) => {
    const { category } = req.params;
    const settings = await settings_service_1.SettingsService.getSettingsByCategory(category);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Category settings retrieved successfully',
        data: settings,
    });
});
/**
 * Bulk update settings
 */
SettingsController.bulkUpdateSettings = (0, catchAsync_1.default)(async (req, res, next) => {
    const { settings } = req.body;
    const user = req.user;
    const results = await settings_service_1.SettingsService.bulkUpdateSettings(settings, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Bulk update completed: ${results.updated.length} updated, ${results.created.length} created, ${results.failed.length} failed`,
        data: results,
    });
});
/**
 * Reset settings to default
 */
SettingsController.resetSettings = (0, catchAsync_1.default)(async (req, res, next) => {
    const { category } = req.body;
    const user = req.user;
    const result = await settings_service_1.SettingsService.resetSettings(category, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: { count: result.count },
    });
});
/**
 * Initialize default settings
 */
SettingsController.initializeDefaultSettings = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await settings_service_1.SettingsService.initializeDefaultSettings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: { count: result.count },
    });
});
/**
 * Import settings
 */
SettingsController.importSettings = (0, catchAsync_1.default)(async (req, res, next) => {
    const { settings, overwrite } = req.body;
    const user = req.user;
    const results = await settings_service_1.SettingsService.importSettings(settings, overwrite, user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Import completed: ${results.imported.length} imported, ${results.skipped.length} skipped, ${results.failed.length} failed`,
        data: results,
    });
});
/**
 * Export all settings
 */
SettingsController.exportSettings = (0, catchAsync_1.default)(async (req, res, next) => {
    const settings = await settings_service_1.SettingsService.exportSettings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Settings exported successfully',
        data: settings,
    });
});
/**
 * Get settings categories
 */
SettingsController.getCategories = (0, catchAsync_1.default)(async (req, res, next) => {
    const categories = await settings_service_1.SettingsService.getCategories();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
    });
});
