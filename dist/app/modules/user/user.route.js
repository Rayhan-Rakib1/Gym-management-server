"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_validation_1 = require("./user.validation");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const checkOwnerShip_1 = require("../../middlewares/checkOwnerShip");
const fileUploader_1 = require("../../../helpers/fileUploader");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(user_validation_1.getUsersQuerySchema), user_controller_1.UserController.getAllUsers);
//   Get user by ID
router.get('/:id', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), user_controller_1.UserController.getUserById);
//   Update user profile
router.put('/:id', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), (0, validateRequest_1.validateRequest)(user_validation_1.updateUserProfileSchema), user_controller_1.UserController.updateUserProfile);
//   Delete user
router.delete('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), user_controller_1.UserController.deleteUser);
//    Get user statistics
router.get('/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), user_controller_1.UserController.getUserStats);
//   Activate/Deactivate user
router.put('/:id/toggle-status', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(user_validation_1.toggleUserStatusSchema), user_controller_1.UserController.toggleUserStatus);
//    Update user role
router.put('/:id/update-role', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(user_validation_1.updateUserRoleSchema), user_controller_1.UserController.updateUserRole);
//    Upload user avatar
router.post('/:id/upload-avatar', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), fileUploader_1.fileUploader.upload.single('avatar'), user_controller_1.UserController.uploadAvatar);
exports.userRoutes = router;
