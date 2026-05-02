"use strict";
// src/modules/progress/progress.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const progress_service_1 = require("./progress.service");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = require("../../../utils/sendResponse");
class ProgressController {
}
exports.ProgressController = ProgressController;
_a = ProgressController;
ProgressController.createBodyMetric = (0, catchAsync_1.default)(async (req, res, next) => {
    const createdBy = req.user?.id;
    const bodyMetric = await progress_service_1.ProgressService.createBodyMetric(req.body, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Body metric recorded successfully',
        data: bodyMetric,
    });
});
ProgressController.getMemberMetrics = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const filters = {
        startDate: req.query.startDate
            ? new Date(req.query.startDate)
            : undefined,
        endDate: req.query.endDate
            ? new Date(req.query.endDate)
            : undefined,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
    };
    const result = await progress_service_1.ProgressService.getMemberMetrics(memberId, filters, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member metrics retrieved successfully',
        data: result.metrics,
        meta: result.pagination,
    });
});
ProgressController.getMetricById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const metric = await progress_service_1.ProgressService.getMetricById(id, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Body metric retrieved successfully',
        data: metric,
    });
});
ProgressController.updateBodyMetric = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updatedBy = req.user?.id;
    const updatedMetric = await progress_service_1.ProgressService.updateBodyMetric(id, req.body, userId, userRole, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Body metric updated successfully',
        data: updatedMetric,
    });
});
ProgressController.deleteBodyMetric = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const deletedBy = req.user?.id;
    const result = await progress_service_1.ProgressService.deleteBodyMetric(id, userId, userRole, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
ProgressController.getLatestMetric = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const metric = await progress_service_1.ProgressService.getLatestMetric(memberId, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: metric
            ? 'Latest metric retrieved successfully'
            : 'No metrics found',
        data: metric,
    });
});
// ============================================
// PROGRESS PHOTOS CONTROLLERS
// ============================================
ProgressController.uploadProgressPhoto = (0, catchAsync_1.default)(async (req, res, next) => {
    const uploadedBy = req.user?.id;
    const progressPhoto = await progress_service_1.ProgressService.uploadProgressPhoto(req.body, uploadedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Progress photo uploaded successfully',
        data: progressPhoto,
    });
});
ProgressController.getMemberPhotos = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const filters = {
        photoType: req.query.photoType,
        startDate: req.query.startDate
            ? new Date(req.query.startDate)
            : undefined,
        endDate: req.query.endDate
            ? new Date(req.query.endDate)
            : undefined,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
    };
    const result = await progress_service_1.ProgressService.getMemberPhotos(memberId, filters, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Progress photos retrieved successfully',
        data: result.photos,
        meta: result.pagination,
    });
});
ProgressController.getPhotoById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const photo = await progress_service_1.ProgressService.getPhotoById(id, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Progress photo retrieved successfully',
        data: photo,
    });
});
ProgressController.deleteProgressPhoto = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const deletedBy = req.user?.id;
    const result = await progress_service_1.ProgressService.deleteProgressPhoto(id, userId, userRole, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
// ============================================
// ANALYTICS & COMPARISON CONTROLLERS
// ============================================
ProgressController.compareMetrics = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { startDate, endDate } = req.query;
    const comparison = await progress_service_1.ProgressService.compareMetrics(memberId, new Date(startDate), new Date(endDate), userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Metrics comparison retrieved successfully',
        data: comparison,
    });
});
ProgressController.getProgressSummary = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const summary = await progress_service_1.ProgressService.getProgressSummary(memberId, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Progress summary retrieved successfully',
        data: summary,
    });
});
ProgressController.calculateBMI = (0, catchAsync_1.default)(async (req, res, next) => {
    const { weight, height } = req.body;
    const result = progress_service_1.ProgressService.calculateBMIPublic(weight, height);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'BMI calculated successfully',
        data: result,
    });
});
