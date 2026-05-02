"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const membership_service_1 = require("./membership.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const ApiError_1 = require("../../errors/ApiError");
class PlanController {
}
exports.PlanController = PlanController;
_a = PlanController;
PlanController.getAllPlans = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await membership_service_1.PlanService.getAllPlans(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Membership plans retrieved successfully',
        data: result.plans,
        meta: result.pagination,
    });
});
PlanController.getActivePlans = (0, catchAsync_1.default)(async (req, res, next) => {
    const plans = await membership_service_1.PlanService.getActivePlans();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Active plans retrieved successfully',
        data: plans,
    });
});
PlanController.getPopularPlans = (0, catchAsync_1.default)(async (req, res, next) => {
    const plans = await membership_service_1.PlanService.getPopularPlans();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Popular plans retrieved successfully',
        data: plans,
    });
});
PlanController.getPlanStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const stats = await membership_service_1.PlanService.getPlanStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Plan statistics retrieved successfully',
        data: stats,
    });
});
PlanController.comparePlans = (0, catchAsync_1.default)(async (req, res, next) => {
    const { planIds } = req.body;
    if (!planIds || !Array.isArray(planIds)) {
        throw new ApiError_1.AppError('planIds array is required', http_status_1.default.BAD_REQUEST);
    }
    const plans = await membership_service_1.PlanService.comparePlans(planIds);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Plans compared successfully',
        data: plans,
    });
});
PlanController.getPlanById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const plan = await membership_service_1.PlanService.getPlanById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Plan retrieved successfully',
        data: plan,
    });
});
PlanController.createPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const createdBy = req.user?.id;
    const plan = await membership_service_1.PlanService.createPlan(req.body, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Membership plan created successfully',
        data: plan,
    });
});
PlanController.updatePlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const updatedBy = req.user?.id;
    const plan = await membership_service_1.PlanService.updatePlan(id, req.body, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Plan updated successfully',
        data: plan,
    });
});
PlanController.togglePlanStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const updatedBy = req.user?.id;
    const plan = await membership_service_1.PlanService.togglePlanStatus(id, req.body, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Plan status updated successfully',
        data: plan,
    });
});
PlanController.deletePlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    const result = await membership_service_1.PlanService.deletePlan(id, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
PlanController.getPlanMembers = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await membership_service_1.PlanService.getPlanMembers(id, page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Plan members retrieved successfully',
        data: result.members,
        meta: result.pagination,
    });
});
PlanController.calculateSavings = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const savings = await membership_service_1.PlanService.calculateSavings(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Savings calculated successfully',
        data: savings,
    });
});
