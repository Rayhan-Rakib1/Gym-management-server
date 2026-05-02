"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = void 0;
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const client_1 = require("@prisma/client");
const ai_validation_1 = require("./ai.validation");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/ai/model-performance
 * @desc    Get AI model performance metrics
 * @access  Admin
 */
router.get('/model-performance', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), ai_controller_1.AIController.getModelPerformance);
/**
 * @route   POST /api/v1/ai/member-profile
 * @desc    Create/Update AI member profile
 * @access  Member, Admin
 */
router.post('/member-profile', auth_1.authenticate, (0, validateRequest_1.validateRequest)(ai_validation_1.createAIMemberProfileSchema), ai_controller_1.AIController.createOrUpdateMemberProfile);
/**
 * @route   POST /api/v1/ai/member-profile/:memberId
 * @desc    Create/Update AI member profile by ID
 * @access  Admin
 */
router.post('/member-profile/:memberId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(ai_validation_1.createAIMemberProfileSchema), ai_controller_1.AIController.createOrUpdateMemberProfile);
/**
 * @route   GET /api/v1/ai/member-profile/:memberId
 * @desc    Get AI member profile
 * @access  Owner, Admin
 */
router.get('/member-profile/:memberId', auth_1.authenticate, ai_controller_1.AIController.getMemberProfile);
/**
 * @route   POST /api/v1/ai/trainer-profile
 * @desc    Create/Update AI trainer profile
 * @access  Admin
 */
router.post('/trainer-profile', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(ai_validation_1.createAITrainerProfileSchema), ai_controller_1.AIController.createOrUpdateTrainerProfile);
/**
 * @route   GET /api/v1/ai/trainer-profile/:trainerId
 * @desc    Get AI trainer profile
 * @access  Admin
 */
router.get('/trainer-profile/:trainerId', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), ai_controller_1.AIController.getTrainerProfile);
/**
 * @route   POST /api/v1/ai/recommend-trainers
 * @desc    Get trainer recommendations
 * @access  Member
 */
router.post('/recommend-trainers', auth_1.authenticate, (0, validateRequest_1.validateRequest)(ai_validation_1.recommendTrainersSchema), ai_controller_1.AIController.recommendTrainers);
/**
 * @route   GET /api/v1/ai/recommendations/member/:memberId
 * @desc    Get member recommendations
 * @access  Owner, Admin
 */
router.get('/recommendations/member/:memberId', auth_1.authenticate, ai_controller_1.AIController.getMemberRecommendations);
/**
 * @route   POST /api/v1/ai/recommendations/:id/accept
 * @desc    Accept recommendation
 * @access  Member
 */
router.post('/recommendations/:id/accept', auth_1.authenticate, (0, validateRequest_1.validateRequest)(ai_validation_1.respondToRecommendationSchema), ai_controller_1.AIController.acceptRecommendation);
/**
 * @route   POST /api/v1/ai/recommendations/:id/reject
 * @desc    Reject recommendation
 * @access  Member
 */
router.post('/recommendations/:id/reject', auth_1.authenticate, (0, validateRequest_1.validateRequest)(ai_validation_1.respondToRecommendationSchema), ai_controller_1.AIController.rejectRecommendation);
/**
 * @route   POST /api/v1/ai/training-data
 * @desc    Submit training data
 * @access  Admin
 */
router.post('/training-data', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(ai_validation_1.submitTrainingDataSchema), ai_controller_1.AIController.submitTrainingData);
/**
 * @route   GET /api/v1/ai/enhanced-recommendations
 * @desc    Get AI-enhanced recommendations using OpenAI
 * @access  Member
 */
router.get('/enhanced-recommendations', auth_1.authenticate, ai_controller_1.AIController.getEnhancedRecommendations);
/**
 * @route   POST /api/v1/ai/generate-workout-plan
 * @desc    Generate personalized workout plan using OpenAI
 * @access  Member
 */
router.post('/generate-workout-plan', auth_1.authenticate, (0, validateRequest_1.validateRequest)(ai_validation_1.generateWorkoutPlanSchema), ai_controller_1.AIController.generateWorkoutPlan);
/**
 * @route   GET /api/v1/ai/analyze-training-data
 * @desc    Analyze training data and get insights using OpenAI
 * @access  Admin
 */
router.get('/analyze-training-data', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), ai_controller_1.AIController.analyzeTrainingData);
exports.aiRoutes = router;
