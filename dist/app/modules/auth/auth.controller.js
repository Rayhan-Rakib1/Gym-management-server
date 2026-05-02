"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const auth_service_1 = require("./auth.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const ApiError_1 = require("../../errors/ApiError");
const config_1 = __importDefault(require("../../../config"));
const http_status_1 = __importDefault(require("http-status"));
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, catchAsync_1.default)(async (req, res, next) => {
    console.log('Request Body:', req.body); // Debugging line
    const result = await auth_service_1.AuthService.register(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: result.message,
        data: { userId: result.userId },
    });
});
AuthController.login = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await auth_service_1.AuthService.login(req.body);
    const { accessToken, refreshToken } = result;
    // Set access token in httpOnly cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config_1.default.node_env === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config_1.default.node_env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Login successful',
        data: {
            user: result.user,
            accessToken: accessToken,
        },
    });
});
AuthController.getMe = (0, catchAsync_1.default)(async (req, res, next) => {
    const userId = req.user?.id;
    const user = await auth_service_1.AuthService.getMe(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile retrieved successfully',
        data: user,
    });
});
AuthController.logout = (0, catchAsync_1.default)(async (req, res, next) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Logout successful',
        data: null,
    });
});
AuthController.refreshToken = (0, catchAsync_1.default)(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
        throw new ApiError_1.AppError('Refresh token not provided', http_status_1.default.UNAUTHORIZED);
    }
    const result = await auth_service_1.AuthService.refreshToken({ refreshToken });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Token refreshed successfully',
        data: {
            accessToken: result.accessToken,
        },
    });
});
AuthController.forgotPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await auth_service_1.AuthService.forgotPassword(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
AuthController.resetPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    const { token } = req.params;
    const result = await auth_service_1.AuthService.resetPassword(token, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
AuthController.verifyEmail = (0, catchAsync_1.default)(async (req, res, next) => {
    const { token } = req.params;
    const result = await auth_service_1.AuthService.verifyEmail(token);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
AuthController.resendVerification = (0, catchAsync_1.default)(async (req, res, next) => {
    const userId = req.user?.id;
    const result = await auth_service_1.AuthService.resendVerification(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
AuthController.changePassword = (0, catchAsync_1.default)(async (req, res, next) => {
    const userId = req.user?.id;
    const result = await auth_service_1.AuthService.changePassword(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
