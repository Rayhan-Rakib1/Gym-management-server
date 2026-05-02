"use strict";
// src/modules/class/class.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const class_service_1 = require("./class.service");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = require("../../../utils/sendResponse");
class ClassController {
}
exports.ClassController = ClassController;
_a = ClassController;
ClassController.createClass = (0, catchAsync_1.default)(async (req, res, next) => {
    const createdBy = req.user?.id;
    const classData = await class_service_1.ClassService.createClass(req.body, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Class created successfully',
        data: classData,
    });
});
ClassController.getAllClasses = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await class_service_1.ClassService.getAllClasses(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Classes retrieved successfully',
        data: result.classes,
        meta: result.pagination,
    });
});
ClassController.getActiveClasses = (0, catchAsync_1.default)(async (req, res, next) => {
    const classes = await class_service_1.ClassService.getActiveClasses();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Active classes retrieved successfully',
        data: classes,
    });
});
ClassController.getClassById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const classData = await class_service_1.ClassService.getClassById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class retrieved successfully',
        data: classData,
    });
});
ClassController.updateClass = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updatedBy = req.user?.id;
    const updatedClass = await class_service_1.ClassService.updateClass(id, req.body, userId, userRole, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class updated successfully',
        data: updatedClass,
    });
});
ClassController.deleteClass = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    const result = await class_service_1.ClassService.deleteClass(id, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
ClassController.toggleClassStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const updatedBy = req.user?.id;
    const updatedClass = await class_service_1.ClassService.toggleClassStatus(id, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Class ${updatedClass.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedClass,
    });
});
ClassController.getTrainerClasses = (0, catchAsync_1.default)(async (req, res, next) => {
    const { trainerId } = req.params;
    const classes = await class_service_1.ClassService.getTrainerClasses(trainerId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer classes retrieved successfully',
        data: classes,
    });
});
ClassController.getClassStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const stats = await class_service_1.ClassService.getClassStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class statistics retrieved successfully',
        data: stats,
    });
});
// ============================================
// SCHEDULE CONTROLLERS
// ============================================
ClassController.getClassSchedules = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const schedules = await class_service_1.ClassService.getClassSchedules(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class schedules retrieved successfully',
        data: schedules,
    });
});
ClassController.createClassSchedule = (0, catchAsync_1.default)(async (req, res, next) => {
    const { classId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const createdBy = req.user?.id;
    const schedule = await class_service_1.ClassService.createClassSchedule(classId, req.body, userId, userRole, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Class schedule created successfully',
        data: schedule,
    });
});
ClassController.updateClassSchedule = (0, catchAsync_1.default)(async (req, res, next) => {
    const { classId, scheduleId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updatedBy = req.user?.id;
    const updatedSchedule = await class_service_1.ClassService.updateClassSchedule(classId, scheduleId, req.body, userId, userRole, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class schedule updated successfully',
        data: updatedSchedule,
    });
});
ClassController.deleteClassSchedule = (0, catchAsync_1.default)(async (req, res, next) => {
    const { classId, scheduleId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const deletedBy = req.user?.id;
    const result = await class_service_1.ClassService.deleteClassSchedule(classId, scheduleId, userId, userRole, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
