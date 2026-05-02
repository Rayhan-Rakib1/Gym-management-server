"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, response) => {
    res.status(response.statusCode).json({
        success: response.success,
        message: response.message,
        data: response.data ?? null,
        ...(response.meta && { meta: response.meta }),
        timestamp: new Date().toISOString(),
    });
};
exports.sendResponse = sendResponse;
