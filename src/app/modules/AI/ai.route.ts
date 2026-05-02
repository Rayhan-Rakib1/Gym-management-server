import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { Role } from '@prisma/client';
import {
    createAIMemberProfileSchema,
    updateAIMemberProfileSchema,
    createAITrainerProfileSchema,
    recommendTrainersSchema,
    respondToRecommendationSchema,
    submitTrainingDataSchema,
    generateWorkoutPlanSchema,
} from './ai.validation';

const router = Router();

/**
 * @route   GET /api/v1/ai/model-performance
 * @desc    Get AI model performance metrics
 * @access  Admin
 */
router.get(
    '/model-performance',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    AIController.getModelPerformance
);

/**
 * @route   POST /api/v1/ai/member-profile
 * @desc    Create/Update AI member profile
 * @access  Member, Admin
 */
router.post(
    '/member-profile',
    authenticate,
    validateRequest(createAIMemberProfileSchema),
    AIController.createOrUpdateMemberProfile
);

/**
 * @route   POST /api/v1/ai/member-profile/:memberId
 * @desc    Create/Update AI member profile by ID
 * @access  Admin
 */
router.post(
    '/member-profile/:memberId',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(createAIMemberProfileSchema),
    AIController.createOrUpdateMemberProfile
);

/**
 * @route   GET /api/v1/ai/member-profile/:memberId
 * @desc    Get AI member profile
 * @access  Owner, Admin
 */
router.get(
    '/member-profile/:memberId',
    authenticate,
    AIController.getMemberProfile
);

/**
 * @route   POST /api/v1/ai/trainer-profile
 * @desc    Create/Update AI trainer profile
 * @access  Admin
 */
router.post(
    '/trainer-profile',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(createAITrainerProfileSchema),
    AIController.createOrUpdateTrainerProfile
);

/**
 * @route   GET /api/v1/ai/trainer-profile/:trainerId
 * @desc    Get AI trainer profile
 * @access  Admin
 */
router.get(
    '/trainer-profile/:trainerId',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    AIController.getTrainerProfile
);

/**
 * @route   POST /api/v1/ai/recommend-trainers
 * @desc    Get trainer recommendations
 * @access  Member
 */
router.post(
    '/recommend-trainers',
    authenticate,
    validateRequest(recommendTrainersSchema),
    AIController.recommendTrainers
);

/**
 * @route   GET /api/v1/ai/recommendations/member/:memberId
 * @desc    Get member recommendations
 * @access  Owner, Admin
 */
router.get(
    '/recommendations/member/:memberId',
    authenticate,
    AIController.getMemberRecommendations
);

/**
 * @route   POST /api/v1/ai/recommendations/:id/accept
 * @desc    Accept recommendation
 * @access  Member
 */
router.post(
    '/recommendations/:id/accept',
    authenticate,
    validateRequest(respondToRecommendationSchema),
    AIController.acceptRecommendation
);

/**
 * @route   POST /api/v1/ai/recommendations/:id/reject
 * @desc    Reject recommendation
 * @access  Member
 */
router.post(
    '/recommendations/:id/reject',
    authenticate,
    validateRequest(respondToRecommendationSchema),
    AIController.rejectRecommendation
);

/**
 * @route   POST /api/v1/ai/training-data
 * @desc    Submit training data
 * @access  Admin
 */
router.post(
    '/training-data',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(submitTrainingDataSchema),
    AIController.submitTrainingData
);

/**
 * @route   GET /api/v1/ai/enhanced-recommendations
 * @desc    Get AI-enhanced recommendations using OpenAI
 * @access  Member
 */
router.get(
    '/enhanced-recommendations',
    authenticate,
    AIController.getEnhancedRecommendations
);

/**
 * @route   POST /api/v1/ai/generate-workout-plan
 * @desc    Generate personalized workout plan using OpenAI
 * @access  Member
 */
router.post(
    '/generate-workout-plan',
    authenticate,
    validateRequest(generateWorkoutPlanSchema),
    AIController.generateWorkoutPlan
);

/**
 * @route   GET /api/v1/ai/analyze-training-data
 * @desc    Analyze training data and get insights using OpenAI
 * @access  Admin
 */
router.get(
    '/analyze-training-data',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    AIController.analyzeTrainingData
);

export const aiRoutes = router;
