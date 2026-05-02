"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const trainer_service_1 = require("./trainer.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
class TrainerController {
}
exports.TrainerController = TrainerController;
_a = TrainerController;
TrainerController.getAllTrainers = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await trainer_service_1.TrainerService.getAllTrainers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainers retrieved successfully',
        data: result.trainers,
        meta: result.pagination,
    });
});
TrainerController.searchTrainers = (0, catchAsync_1.default)(async (req, res, next) => {
    const filters = {
        specializations: req.query.specializations
            ? req.query.specializations.split(',')
            : undefined,
        minRating: req.query.minRating
            ? parseFloat(req.query.minRating)
            : undefined,
        isAvailable: req.query.isAvailable
            ? req.query.isAvailable === 'true'
            : undefined,
        dayOfWeek: req.query.dayOfWeek,
        timeSlot: req.query.timeSlot,
    };
    const trainers = await trainer_service_1.TrainerService.searchTrainers(filters);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainers found successfully',
        data: trainers,
    });
});
TrainerController.getTrainerStats = (0, catchAsync_1.default)(async (req, res, next) => {
    const stats = await trainer_service_1.TrainerService.getTrainerStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer statistics retrieved successfully',
        data: stats,
    });
});
TrainerController.getTrainerById = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const trainer = await trainer_service_1.TrainerService.getTrainerById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer retrieved successfully',
        data: trainer,
    });
});
TrainerController.createTrainer = (0, catchAsync_1.default)(async (req, res, next) => {
    const createdBy = req.user?.id;
    const trainer = await trainer_service_1.TrainerService.createTrainer(req.body, createdBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Trainer created successfully',
        data: trainer,
    });
});
TrainerController.updateTrainer = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const updatedBy = req.user?.id;
    const trainer = await trainer_service_1.TrainerService.updateTrainer(id, req.body, updatedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer updated successfully',
        data: trainer,
    });
});
TrainerController.deleteTrainer = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    const result = await trainer_service_1.TrainerService.deleteTrainer(id, deletedBy);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
TrainerController.getTrainerDashboard = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const dashboard = await trainer_service_1.TrainerService.getTrainerDashboard(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboard,
    });
});
TrainerController.getTrainerMembers = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await trainer_service_1.TrainerService.getTrainerMembers(id, page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer members retrieved successfully',
        data: result.members,
        meta: result.pagination,
    });
});
TrainerController.getTrainerReviews = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await trainer_service_1.TrainerService.getTrainerReviews(id, page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer reviews retrieved successfully',
        data: result.reviews,
        meta: result.pagination,
    });
});
TrainerController.getTrainerPerformance = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const performance = await trainer_service_1.TrainerService.getTrainerPerformance(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer performance retrieved successfully',
        data: performance,
    });
});
TrainerController.addSpecialization = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const specialization = await trainer_service_1.TrainerService.addSpecialization(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Specialization added successfully',
        data: specialization,
    });
});
TrainerController.updateSpecialization = (0, catchAsync_1.default)(async (req, res, next) => {
    const { specId } = req.params;
    const specialization = await trainer_service_1.TrainerService.updateSpecialization(specId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Specialization updated successfully',
        data: specialization,
    });
});
TrainerController.deleteSpecialization = (0, catchAsync_1.default)(async (req, res, next) => {
    const { specId } = req.params;
    const result = await trainer_service_1.TrainerService.deleteSpecialization(specId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
TrainerController.setAvailability = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const availability = await trainer_service_1.TrainerService.setAvailability(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Availability set successfully',
        data: availability,
    });
});
TrainerController.updateAvailability = (0, catchAsync_1.default)(async (req, res, next) => {
    const { availId } = req.params;
    const availability = await trainer_service_1.TrainerService.updateAvailability(availId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Availability updated successfully',
        data: availability,
    });
});
TrainerController.deleteAvailability = (0, catchAsync_1.default)(async (req, res, next) => {
    const { availId } = req.params;
    const result = await trainer_service_1.TrainerService.deleteAvailability(availId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null,
    });
});
