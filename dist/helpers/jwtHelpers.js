"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
// Define Role type
const generateAccessToken = (userId, role, email, name) => {
    const payload = { userId, role, email, name };
    const expiresIn = config_1.default.jwt.access_expiry || '15m';
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.access_secret, { expiresIn });
};
exports.generateAccessToken = generateAccessToken;
// Generate Refresh Token 
const generateRefreshToken = (userId) => {
    const payload = { userId };
    const expiresIn = config_1.default.jwt.refresh_expiry || '7d';
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.refresh_secret, { expiresIn });
};
exports.generateRefreshToken = generateRefreshToken;
