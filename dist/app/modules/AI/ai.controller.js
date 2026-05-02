"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_1 = require("./ai.service");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = require("../../../utils/sendResponse");
class AIController {
}
exports.AIController = AIController;
_a = AIController;
AIController.createOrUpdateMemberProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const memberId = req.params.memberId || req.user?.id;
    const profile = await ai_service_1.AIService.createOrUpdateMemberProfile(memberId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'AI member profile saved successfully',
        data: profile,
    });
});
AIController.getMemberProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const profile = await ai_service_1.AIService.getMemberProfile(memberId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'AI member profile retrieved successfully',
        data: profile,
    });
});
AIController.createOrUpdateTrainerProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const { trainerId } = req.body;
    const profile = await ai_service_1.AIService.createOrUpdateTrainerProfile(trainerId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'AI trainer profile saved successfully',
        data: profile,
    });
});
AIController.getTrainerProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const { trainerId } = req.params;
    const profile = await ai_service_1.AIService.getTrainerProfile(trainerId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'AI trainer profile retrieved successfully',
        data: profile,
    });
});
AIController.recommendTrainers = (0, catchAsync_1.default)(async (req, res, next) => {
    const requesterId = req.user?.id;
    const recommendations = await ai_service_1.AIService.recommendTrainers(req.body, requesterId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Trainer recommendations generated successfully',
        data: recommendations,
    });
});
AIController.getMemberRecommendations = (0, catchAsync_1.default)(async (req, res, next) => {
    const { memberId } = req.params;
    const recommendations = await ai_service_1.AIService.getMemberRecommendations(memberId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Recommendations retrieved successfully',
        data: recommendations,
    });
});
AIController.acceptRecommendation = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const recommendation = await ai_service_1.AIService.acceptRecommendation(id, { status: 'ACCEPTED', ...req.body }, memberId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Recommendation accepted successfully. Trainer has been assigned!',
        data: recommendation,
    });
});
AIController.rejectRecommendation = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const recommendation = await ai_service_1.AIService.acceptRecommendation(id, { status: 'REJECTED', ...req.body }, memberId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Recommendation rejected',
        data: recommendation,
    });
});
AIController.submitTrainingData = (0, catchAsync_1.default)(async (req, res, next) => {
    const trainingData = await ai_service_1.AIService.submitTrainingData(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'Training data submitted successfully',
        data: trainingData,
    });
});
AIController.getModelPerformance = (0, catchAsync_1.default)(async (req, res, next) => {
    const performance = await ai_service_1.AIService.getModelPerformance();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'AI model performance retrieved successfully',
        data: performance,
    });
});
AIController.getEnhancedRecommendations = (0, catchAsync_1.default)(async (req, res, next) => {
    const memberId = req.user?.id;
    const topN = parseInt(req.query.topN) || 5;
    const recommendations = await ai_service_1.AIService.getEnhancedRecommendations(memberId, topN);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'AI-enhanced recommendations retrieved successfully',
        data: recommendations,
    });
});
AIController.generateWorkoutPlan = (0, catchAsync_1.default)(async (req, res, next) => {
    const memberId = req.user?.id;
    const { trainerId, durationWeeks } = req.body;
    const workoutPlan = await ai_service_1.AIService.generateWorkoutPlanForMember(memberId, trainerId, durationWeeks || 12);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Workout plan generated successfully',
        data: workoutPlan,
    });
});
AIController.analyzeTrainingData = (0, catchAsync_1.default)(async (req, res, next) => {
    const trainerId = req.query.trainerId;
    const insights = await ai_service_1.AIService.analyzeTrainingDataInsights(trainerId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Training data insights retrieved successfully',
        data: insights,
    });
});
