"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("../errors/ApiError");
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const config_1 = __importDefault(require("../../config"));
const authenticate = async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken;
        // If not in cookies, try Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            throw new ApiError_1.AppError('Authentication required', http_status_1.default.UNAUTHORIZED);
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.access_secret);
        // Check if user exists and is active
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new ApiError_1.AppError('User not found', http_status_1.default.NOT_FOUND);
        }
        if (!user.isActive) {
            throw new ApiError_1.AppError('Your account has been deactivated', http_status_1.default.FORBIDDEN);
        }
        // Attach user to request
        req.user = {
            id: user.id,
            role: user.role,
            email: user.email,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new ApiError_1.AppError('Invalid token', http_status_1.default.UNAUTHORIZED));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new ApiError_1.AppError('Token expired', http_status_1.default.UNAUTHORIZED));
        }
        next(error);
    }
};
exports.authenticate = authenticate;
