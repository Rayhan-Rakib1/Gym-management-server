"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const ApiError_1 = require("../../errors/ApiError");
const user_service_1 = require("./user.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const fileUploader_1 = require("../../../helpers/fileUploader");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.getAllUsers = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await user_service_1.UserService.getAllUsers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: {
            page: 1,
            limit: 10,
            total: result.users.length,
        },
    });
});
UserController.getUserById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_service_1.UserService.getUserById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User retrieved successfully',
        data: user,
    });
});
UserController.updateUserProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_service_1.UserService.updateUserProfile(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile updated successfully',
        data: user,
    });
});
UserController.deleteUser = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await user_service_1.UserService.deleteUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
UserController.toggleUserStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_service_1.UserService.toggleUserStatus(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'User status updated successfully',
        data: user,
    });
});
UserController.updateUserRole = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_service_1.UserService.updateUserRole(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User role updated successfully',
        data: user,
    });
});
UserController.getUserStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const stats = await user_service_1.UserService.getUserStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats,
    });
});
UserController.uploadAvatar = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const file = req.file;
    if (!file)
        throw new ApiError_1.AppError("No image uploaded", http_status_1.default.BAD_REQUEST);
    const result = await fileUploader_1.fileUploader.uploadToCloudinary(file);
    await user_service_1.UserService.uploadAvatar(id, result.url);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Avatar uploaded successfully',
        data: result,
    });
});
