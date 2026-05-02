"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRoutes = void 0;
const express_1 = require("express");
const settings_controller_1 = require("./settings.controller");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const client_1 = require("@prisma/client");
const settings_validation_1 = require("./settings.validation");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/settings/public
 * @desc    Get public settings (no auth required)
 * @access  Public
 */
router.get('/public', settings_controller_1.SettingsController.getPublicSettings);
/**
 * @route   GET /api/v1/settings/categories
 * @desc    Get all settings categories
 * @access  Super Admin
 */
router.get('/categories', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), settings_controller_1.SettingsController.getCategories);
/**
 * @route   POST /api/v1/settings/initialize
 * @desc    Initialize default settings
 * @access  Super Admin
 */
router.post('/initialize', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), settings_controller_1.SettingsController.initializeDefaultSettings);
/**
 * @route   POST /api/v1/settings/bulk-update
 * @desc    Bulk update settings
 * @access  Super Admin
 */
router.post('/bulk-update', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.bulkUpdateSettingsSchema), settings_controller_1.SettingsController.bulkUpdateSettings);
/**
 * @route   POST /api/v1/settings/reset
 * @desc    Reset settings to default
 * @access  Super Admin
 */
router.post('/reset', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.resetSettingsSchema), settings_controller_1.SettingsController.resetSettings);
/**
 * @route   POST /api/v1/settings/import
 * @desc    Import settings
 * @access  Super Admin
 */
router.post('/import', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.importSettingsSchema), settings_controller_1.SettingsController.importSettings);
/**
 * @route   GET /api/v1/settings/export
 * @desc    Export all settings
 * @access  Super Admin
 */
router.get('/export', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), settings_controller_1.SettingsController.exportSettings);
/**
 * @route   GET /api/v1/settings
 * @desc    Get all settings
 * @access  Super Admin
 */
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.getAllSettingsQuerySchema), settings_controller_1.SettingsController.getAllSettings);
/**
 * @route   POST /api/v1/settings
 * @desc    Create new setting
 * @access  Super Admin
 */
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.createSettingSchema), settings_controller_1.SettingsController.createSetting);
/**
 * @route   GET /api/v1/settings/category/:category
 * @desc    Get settings by category
 * @access  Super Admin
 */
router.get('/category/:category', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.getSettingsByCategorySchema), settings_controller_1.SettingsController.getSettingsByCategory);
/**
 * @route   GET /api/v1/settings/:key
 * @desc    Get setting by key
 * @access  Super Admin
 */
router.get('/:key', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.getSettingByKeySchema), settings_controller_1.SettingsController.getSettingByKey);
/**
 * @route   PUT /api/v1/settings/:key
 * @desc    Update setting
 * @access  Super Admin
 */
router.put('/:key', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.updateSettingSchema), settings_controller_1.SettingsController.updateSetting);
/**
 * @route   DELETE /api/v1/settings/:key
 * @desc    Delete setting
 * @access  Super Admin
 */
router.delete('/:key', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(settings_validation_1.deleteSettingSchema), settings_controller_1.SettingsController.deleteSetting);
exports.SettingsRoutes = router;
