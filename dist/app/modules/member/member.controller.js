"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = require("../../../utils/sendResponse");
const member_service_1 = require("./member.service");
class MemberController {
}
exports.MemberController = MemberController;
_a = MemberController;
MemberController.getAllMembers = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await member_service_1.MemberService.getAllMembers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Members retrieved successfully',
        data: result.members,
        meta: result.pagination,
    });
});
MemberController.getMemberById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const member = await member_service_1.MemberService.getMemberById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member retrieved successfully',
        data: member,
    });
});
MemberController.createMember = (0, catchAsync_1.default)(async (req, res, next) => {
    const createdBy = req.user?.id;
    const member = await member_service_1.MemberService.createMember(req.body, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Member created successfully',
        data: member,
    });
});
MemberController.updateMember = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const updatedBy = req.user?.id;
    const member = await member_service_1.MemberService.updateMember(id, req.body, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member updated successfully',
        data: member,
    });
});
MemberController.updateFitnessProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const member = await member_service_1.MemberService.updateFitnessProfile(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Fitness profile updated successfully',
        data: member,
    });
});
MemberController.assignTrainer = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const assignedBy = req.user?.id;
    const member = await member_service_1.MemberService.assignTrainer(id, req.body, assignedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer assigned successfully',
        data: member,
    });
});
MemberController.updateMemberPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const updatedBy = req.user?.id;
    const member = await member_service_1.MemberService.updateMemberPlan(id, req.body, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Membership plan updated successfully',
        data: member,
    });
});
MemberController.renewMembership = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const result = await member_service_1.MemberService.renewMembership(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Membership renewed successfully',
        data: result,
    });
});
MemberController.deleteMember = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    const result = await member_service_1.MemberService.deleteMember(id, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
MemberController.getMemberDashboard = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const dashboard = await member_service_1.MemberService.getMemberDashboard(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboard,
    });
});
MemberController.getExpiringMembers = (0, catchAsync_1.default)(async (req, res, next) => {
    const days = parseInt(req.query.days) || 7;
    const members = await member_service_1.MemberService.getExpiringMembers(days);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Expiring members retrieved successfully',
        data: members,
    });
});
MemberController.getMemberStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const stats = await member_service_1.MemberService.getMemberStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Member statistics retrieved successfully',
        data: stats,
    });
});
