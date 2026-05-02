import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import catchAsync from '../../../utils/catchAsync';
import { sendResponse } from '../../../utils/sendResponse';

export class AIController {
    static createOrUpdateMemberProfile = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const memberId = req.params.memberId || req.user?.id!;

            const profile = await AIService.createOrUpdateMemberProfile(
                memberId,
                req.body
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'AI member profile saved successfully',
                data: profile,
            });
        }
    );

    static getMemberProfile = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { memberId } = req.params;
            const profile = await AIService.getMemberProfile(memberId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'AI member profile retrieved successfully',
                data: profile,
            });
        }
    );

    static createOrUpdateTrainerProfile = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { trainerId } = req.body;

            const profile = await AIService.createOrUpdateTrainerProfile(
                trainerId,
                req.body
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'AI trainer profile saved successfully',
                data: profile,
            });
        }
    );

    static getTrainerProfile = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { trainerId } = req.params;
            const profile = await AIService.getTrainerProfile(trainerId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'AI trainer profile retrieved successfully',
                data: profile,
            });
        }
    );

    static recommendTrainers = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const requesterId = req.user?.id;
            const recommendations = await AIService.recommendTrainers(
                req.body,
                requesterId
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Trainer recommendations generated successfully',
                data: recommendations,
            });
        }
    );

    static getMemberRecommendations = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { memberId } = req.params;
            const recommendations = await AIService.getMemberRecommendations(memberId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Recommendations retrieved successfully',
                data: recommendations,
            });
        }
    );

    static acceptRecommendation = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const memberId = req.user?.id!;

            const recommendation = await AIService.acceptRecommendation(
                id,
                { status: 'ACCEPTED', ...req.body },
                memberId
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Recommendation accepted successfully. Trainer has been assigned!',
                data: recommendation,
            });
        }
    );

    static rejectRecommendation = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const memberId = req.user?.id!;

            const recommendation = await AIService.acceptRecommendation(
                id,
                { status: 'REJECTED', ...req.body },
                memberId
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Recommendation rejected',
                data: recommendation,
            });
        }
    );

    static submitTrainingData = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const trainingData = await AIService.submitTrainingData(req.body);

            sendResponse(res, {
                statusCode: 201,
                success: true,
                message: 'Training data submitted successfully',
                data: trainingData,
            });
        }
    );

    static getModelPerformance = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const performance = await AIService.getModelPerformance();

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'AI model performance retrieved successfully',
                data: performance,
            });
        }
    );

    static getEnhancedRecommendations = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const memberId = req.user?.id!;
            const topN = parseInt(req.query.topN as string) || 5;

            const recommendations = await AIService.getEnhancedRecommendations(
                memberId,
                topN
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'AI-enhanced recommendations retrieved successfully',
                data: recommendations,
            });
        }
    );

    static generateWorkoutPlan = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const memberId = req.user?.id!;
            const { trainerId, durationWeeks } = req.body;

            const workoutPlan = await AIService.generateWorkoutPlanForMember(
                memberId,
                trainerId,
                durationWeeks || 12
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Workout plan generated successfully',
                data: workoutPlan,
            });
        }
    );

    static analyzeTrainingData = catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const trainerId = req.query.trainerId as string;

            const insights = await AIService.analyzeTrainingDataInsights(trainerId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: 'Training data insights retrieved successfully',
                data: insights,
            });
        }
    );
}
