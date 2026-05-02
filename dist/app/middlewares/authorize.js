"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const ApiError_1 = require("../errors/ApiError");
const http_status_1 = __importDefault(require("http-status"));
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError_1.AppError('Unauthorized', http_status_1.default.UNAUTHORIZED);
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError_1.AppError('You do not have permission to perform this action', http_status_1.default.FORBIDDEN);
        }
        next();
    };
};
exports.authorize = authorize;
