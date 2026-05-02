"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rateLimiter = (maxRequests, windowMinutes) => {
    return (0, express_rate_limit_1.default)({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        message: {
            success: false,
            message: 'Too many requests, please try again later.',
            timestamp: new Date().toISOString(),
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};
exports.rateLimiter = rateLimiter;
