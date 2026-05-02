"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnership = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = require("../errors/ApiError");
const client_1 = require("@prisma/client");
const checkOwnership = (resource) => {
    return (req, res, next) => {
        const userId = req.params.id;
        const currentUser = req.user;
        // Super Admin and Admin can access any resource
        if (currentUser?.role === client_1.Role.SUPER_ADMIN ||
            currentUser?.role === client_1.Role.ADMIN) {
            return next();
        }
        // Check if user is accessing their own resource
        if (currentUser?.id !== userId) {
            throw new ApiError_1.AppError('You are not authorized to access this resource', http_status_1.default.FORBIDDEN);
        }
        next();
    };
};
exports.checkOwnership = checkOwnership;
