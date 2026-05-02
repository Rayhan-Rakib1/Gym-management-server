import prisma from '../../../shared/prisma';
import { AppError } from '../../errors/ApiError';
import httpStatus from 'http-status';
import {
    CreateAIMemberProfileInput,
    UpdateAIMemberProfileInput,
    CreateAITrainerProfileInput,
    RecommendTrainersInput,
    RespondToRecommendationInput,
    SubmitTrainingDataInput,
} from './ai.validation';
import {
    generateEnhancedRecommendations,
    generateWorkoutPlan,
    analyzeTrainingData as analyzeTrainingDataWithAI,
} from '../../../utils/openai';

export class AIService {
    static async createOrUpdateMemberProfile(
        memberId: string,
        data: CreateAIMemberProfileInput
    ) {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            throw new AppError('Member not found', httpStatus.NOT_FOUND);
        }

        const profile = await prisma.aIMemberProfile.upsert({
            where: { memberId },
            create: {
                memberId,
                ...data,
                lastUpdated: new Date(),
            },
            update: {
                ...data,
                lastUpdated: new Date(),
            },
        });

        return profile;
    }

    static async getMemberProfile(memberId: string) {
        const profile = await prisma.aIMemberProfile.findUnique({
            where: { memberId },
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!profile) {
            throw new AppError('AI Member profile not found', httpStatus.NOT_FOUND);
        }

        return profile;
    }

    static async createOrUpdateTrainerProfile(
        trainerId: string,
        data: CreateAITrainerProfileInput
    ) {
        const trainer = await prisma.trainer.findUnique({
            where: { id: trainerId },
        });

        if (!trainer) {
            throw new AppError('Trainer not found', httpStatus.NOT_FOUND);
        }

        const trainerData = await prisma.trainer.findUnique({
            where: { id: trainerId },
            include: {
                specializations: true,
                reviews: true,
            },
        });

        const profile = await prisma.aITrainerProfile.upsert({
            where: { trainerId },
            create: {
                trainerId,
                ...data,
                successRate: trainerData!.successRate,
                averageRating: trainerData!.rating,
                totalClientsHandled: trainerData!.totalClients,
                lastUpdated: new Date(),
            },
            update: {
                ...data,
                successRate: trainerData!.successRate,
                averageRating: trainerData!.rating,
                totalClientsHandled: trainerData!.totalClients,
                lastUpdated: new Date(),
            },
        });

        return profile;
    }

    static async getTrainerProfile(trainerId: string) {
        const profile = await prisma.aITrainerProfile.findUnique({
            where: { trainerId },
            include: {
                trainer: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                        specializations: true,
                    },
                },
            },
        });

        if (!profile) {
            throw new AppError('AI Trainer profile not found', httpStatus.NOT_FOUND);
        }

        return profile;
    }

    static async recommendTrainers(data: RecommendTrainersInput, requesterId?: string) {
        const { memberId, topN = 5, filters = {} } = data;

        const targetMemberId = memberId || requesterId;

        if (!targetMemberId) {
            throw new AppError('Member ID is required', httpStatus.BAD_REQUEST);
        }

        const memberProfile = await prisma.aIMemberProfile.findUnique({
            where: { memberId: targetMemberId },
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!memberProfile) {
            throw new AppError(
                'Please complete your AI profile first to get recommendations',
                httpStatus.NOT_FOUND
            );
        }

        const whereClause: any = {
            user: { isActive: true },
        };

        if (filters.isAvailable !== undefined) {
            whereClause.isAvailable = filters.isAvailable;
        }

        if (filters.minRating) {
            whereClause.rating = { gte: filters.minRating };
        }

        const trainers = await prisma.trainer.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        profileImage: true,
                    },
                },
                specializations: true,
                availability: true,
                aiTrainerProfile: true,
                reviews: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (trainers.length === 0) {
            throw new AppError('No trainers available for recommendation', httpStatus.NOT_FOUND);
        }

        let recommendations = trainers
            .map((trainer) => {
                if (filters.maxCapacity && trainer.currentClients >= trainer.maxCapacity) {
                    return null;
                }

                const score = this.calculateMatchScore(memberProfile, trainer);
                const reasons = this.generateMatchReasons(memberProfile, trainer, score);

                return {
                    trainer,
                    matchScore: score.total,
                    matchReasons: reasons,
                    breakdown: score.breakdown,
                };
            })
            .filter((rec) => rec !== null)
            .sort((a: any, b: any) => b.matchScore - a.matchScore)
            .slice(0, topN);

        const savedRecommendations = await Promise.all(
            recommendations.map(async (rec: any) => {
                return prisma.aIRecommendation.upsert({
                    where: {
                        memberId_trainerId: {
                            memberId: targetMemberId,
                            trainerId: rec.trainer.id,
                        },
                    },
                    create: {
                        memberId: targetMemberId,
                        trainerId: rec.trainer.id,
                        matchScore: rec.matchScore,
                        matchReasons: rec.matchReasons,
                        memberProfileSnapshot: memberProfile as any,
                        trainerProfileSnapshot: rec.trainer as any,
                        status: 'PENDING',
                    },
                    update: {
                        matchScore: rec.matchScore,
                        matchReasons: rec.matchReasons,
                        memberProfileSnapshot: memberProfile as any,
                        trainerProfileSnapshot: rec.trainer as any,
                        recommendedAt: new Date(),
                    },
                    include: {
                        trainer: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                        profileImage: true,
                                    },
                                },
                                specializations: true,
                                reviews: {
                                    take: 3,
                                    orderBy: { createdAt: 'desc' },
                                },
                            },
                        },
                    },
                });
            })
        );

        return savedRecommendations;
    }

    private static calculateMatchScore(memberProfile: any, trainer: any) {
        let totalScore = 0;
        const breakdown: any = {};

        const goalScore = this.calculateGoalMatch(
            memberProfile.fitnessGoals,
            trainer.specializations
        );
        breakdown.goalMatch = goalScore;
        totalScore += goalScore;

        const experienceScore = this.calculateExperienceMatch(
            memberProfile.experienceLevel,
            trainer.aiTrainerProfile
        );
        breakdown.experienceMatch = experienceScore;
        totalScore += experienceScore;

        const healthScore = this.calculateHealthMatch(
            memberProfile.healthConditions,
            trainer.specializations
        );
        breakdown.healthMatch = healthScore;
        totalScore += healthScore;

        const performanceScore = this.calculatePerformanceScore(trainer);
        breakdown.performanceScore = performanceScore;
        totalScore += performanceScore;

        const ratingScore = (trainer.rating / 5) * 10;
        breakdown.ratingScore = ratingScore;
        totalScore += ratingScore;

        const availabilityScore = this.calculateAvailabilityMatch(
            memberProfile.preferredTime,
            trainer.availability
        );
        breakdown.availabilityScore = availabilityScore;
        totalScore += availabilityScore;

        return {
            total: Math.round(totalScore),
            breakdown,
        };
    }

    private static calculateGoalMatch(
        memberGoals: string[],
        trainerSpecializations: any[]
    ): number {
        const specializationMap: Record<string, string[]> = {
            'weight loss': ['CARDIO', 'NUTRITION', 'HIIT'],
            'muscle building': ['WEIGHT_TRAINING', 'STRENGTH_TRAINING', 'NUTRITION'],
            'stamina': ['CARDIO', 'HIIT', 'SPORTS_SPECIFIC'],
            'flexibility': ['YOGA', 'PILATES', 'FLEXIBILITY'],
            'body toning': ['WEIGHT_TRAINING', 'PILATES', 'CARDIO'],
            'strength training': ['WEIGHT_TRAINING', 'STRENGTH_TRAINING', 'CROSSFIT'],
        };

        let matchCount = 0;
        let totalPossible = 0;

        memberGoals.forEach((goal) => {
            const goalLower = goal.toLowerCase();
            const requiredSpecs = specializationMap[goalLower] || [];
            totalPossible += requiredSpecs.length;

            requiredSpecs.forEach((reqSpec) => {
                const hasSpec = trainerSpecializations.some(
                    (spec) => spec.specialization === reqSpec
                );
                if (hasSpec) matchCount++;
            });
        });

        return totalPossible > 0 ? (matchCount / totalPossible) * 30 : 0;
    }

    private static calculateExperienceMatch(
        memberLevel: string,
        trainerProfile: any
    ): number {
        if (!trainerProfile) return 10;

        const expertiseLevels = trainerProfile.expertiseLevel || [];

        if (memberLevel === 'BEGINNER' && expertiseLevels.includes('beginner')) {
            return 20;
        }
        if (memberLevel === 'ADVANCED' && expertiseLevels.includes('advanced')) {
            return 20;
        }
        if (
            memberLevel === 'INTERMEDIATE' &&
            (expertiseLevels.includes('beginner') || expertiseLevels.includes('advanced'))
        ) {
            return 15;
        }

        return 10;
    }

    private static calculateHealthMatch(
        healthConditions: string[],
        specializations: any[]
    ): number {
        if (healthConditions.length === 0) return 20;

        const hasRehabilitation = specializations.some(
            (spec) => spec.specialization === 'REHABILITATION'
        );

        if (healthConditions.length > 0 && hasRehabilitation) {
            return 20;
        } else if (healthConditions.length > 0) {
            return 10;
        }

        return 15;
    }

    private static calculatePerformanceScore(trainer: any): number {
        const successRate = trainer.successRate || 0;

        if (successRate >= 80) return 15;
        if (successRate >= 60) return 10;
        if (successRate >= 40) return 5;
        return 3;
    }

    private static calculateAvailabilityMatch(
        preferredTime: string | null,
        availability: any[]
    ): number {
        if (!preferredTime || availability.length === 0) return 3;

        const timeMap: Record<string, string[]> = {
            MORNING: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
            AFTERNOON: ['12:00', '13:00', '14:00', '15:00', '16:00'],
            EVENING: ['17:00', '18:00', '19:00', '20:00', '21:00'],
        };

        const preferredSlots = timeMap[preferredTime] || [];
        const hasMatch = availability.some((avail: any) =>
            preferredSlots.some((slot) => avail.startTime <= slot && avail.endTime > slot)
        );

        return hasMatch ? 5 : 2;
    }

    private static generateMatchReasons(
        memberProfile: any,
        trainer: any,
        score: any
    ): any[] {
        const reasons: any[] = []; if (score.breakdown.goalMatch >= 20) {
            reasons.push({
                type: 'goal',
                message: `Perfect match for your ${memberProfile.fitnessGoals.join(', ')} goals`,
                score: score.breakdown.goalMatch,
            });
        }

        if (score.breakdown.experienceMatch >= 15) {
            reasons.push({
                type: 'experience',
                message: `${memberProfile.experienceLevel.toLowerCase()}-friendly trainer`,
                score: score.breakdown.experienceMatch,
            });
        }

        if (trainer.successRate >= 80) {
            reasons.push({
                type: 'performance',
                message: `${trainer.successRate}% success rate with similar clients`,
                score: score.breakdown.performanceScore,
            });
        }

        if (trainer.rating >= 4.5) {
            reasons.push({
                type: 'rating',
                message: `Highly rated at ${trainer.rating}/5 stars`,
                score: score.breakdown.ratingScore,
            });
        }

        if (score.breakdown.availabilityScore >= 4) {
            reasons.push({
                type: 'availability',
                message: `Available during your preferred time`,
                score: score.breakdown.availabilityScore,
            });
        }

        return reasons;
    }

    static async getMemberRecommendations(memberId: string) {
        const recommendations = await prisma.aIRecommendation.findMany({
            where: { memberId },
            include: {
                trainer: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                profileImage: true,
                            },
                        },
                        specializations: true,
                        reviews: {
                            take: 3,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                member: {
                                    include: {
                                        user: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { matchScore: 'desc' },
        });

        return recommendations;
    }

    static async acceptRecommendation(
        recommendationId: string,
        data: RespondToRecommendationInput,
        memberId: string
    ) {
        const recommendation = await prisma.aIRecommendation.findUnique({
            where: { id: recommendationId },
            include: {
                member: true,
                trainer: true,
            },
        });

        if (!recommendation) {
            throw new AppError('Recommendation not found', httpStatus.NOT_FOUND);
        }

        if (recommendation.memberId !== memberId) {
            throw new AppError('Unauthorized', httpStatus.FORBIDDEN);
        }

        const updated = await prisma.$transaction(async (tx) => {
            const updatedRec = await tx.aIRecommendation.update({
                where: { id: recommendationId },
                data: {
                    status: data.status,
                    respondedAt: new Date(),
                },
            });

            if (data.status === 'ACCEPTED') {
                if (
                    recommendation.trainer.currentClients >= recommendation.trainer.maxCapacity
                ) {
                    throw new AppError('Trainer has reached maximum capacity', httpStatus.BAD_REQUEST);
                }

                if (recommendation.member.assignedTrainerId) {
                    await tx.trainer.update({
                        where: { id: recommendation.member.assignedTrainerId },
                        data: {
                            currentClients: { decrement: 1 },
                        },
                    });
                }

                await tx.member.update({
                    where: { id: memberId },
                    data: {
                        assignedTrainerId: recommendation.trainerId,
                        trainerAssignedDate: new Date(),
                    },
                });

                await tx.trainer.update({
                    where: { id: recommendation.trainerId },
                    data: {
                        currentClients: { increment: 1 },
                    },
                });

                await tx.aITrainingData.create({
                    data: {
                        memberId,
                        trainerId: recommendation.trainerId,
                        matchScore: recommendation.matchScore,
                        goalAchieved: false,
                        achievementPercentage: 0,
                        durationDays: 0,
                    },
                });
            }

            return updatedRec;
        });

        return updated;
    }

    static async submitTrainingData(data: SubmitTrainingDataInput) {
        const { memberId, trainerId, ...rest } = data;

        const [member, trainer] = await Promise.all([
            prisma.member.findUnique({ where: { id: memberId } }),
            prisma.trainer.findUnique({ where: { id: trainerId } }),
        ]);

        if (!member || !trainer) {
            throw new AppError('Member or Trainer not found', httpStatus.NOT_FOUND);
        }

        const trainingData = await prisma.aITrainingData.create({
            data: {
                memberId,
                trainerId,
                ...rest,
            },
        });

        const allTrainingData = await prisma.aITrainingData.findMany({
            where: { trainerId },
        });

        const successfulCount = allTrainingData.filter((d) => d.goalAchieved).length;
        const successRate = (successfulCount / allTrainingData.length) * 100;

        await prisma.trainer.update({
            where: { id: trainerId },
            data: { successRate: Math.round(successRate) },
        });

        return trainingData;
    }

    static async getModelPerformance() {
        const [
            totalRecommendations,
            acceptedRecommendations,
            avgMatchScore,
            trainingDataCount,
            avgGoalAchievement,
        ] = await Promise.all([
            prisma.aIRecommendation.count(),
            prisma.aIRecommendation.count({
                where: { status: 'ACCEPTED' },
            }),
            prisma.aIRecommendation.aggregate({
                _avg: { matchScore: true },
            }),
            prisma.aITrainingData.count(),
            prisma.aITrainingData.aggregate({
                _avg: { achievementPercentage: true },
            }),
        ]);

        const acceptanceRate =
            totalRecommendations > 0
                ? (acceptedRecommendations / totalRecommendations) * 100
                : 0;

        return {
            totalRecommendations,
            acceptedRecommendations,
            rejectedRecommendations: totalRecommendations - acceptedRecommendations,
            acceptanceRate: Math.round(acceptanceRate),
            avgMatchScore: Math.round(avgMatchScore._avg.matchScore || 0),
            trainingDataCount,
            avgGoalAchievement: Math.round(avgGoalAchievement._avg.achievementPercentage || 0),
        };
    }

    /**
     * Get AI-enhanced recommendations using OpenAI
     */
    static async getEnhancedRecommendations(
        memberId: string,
        topN: number = 5
    ) {
        // Get basic recommendations first
        const recommendations = await this.recommendTrainers(
            { memberId, topN },
            memberId
        );

        if (recommendations.length === 0) {
            return recommendations;
        }

        // Get member profile
        const memberProfile = await prisma.aIMemberProfile.findUnique({
            where: { memberId },
        });

        if (!memberProfile) {
            return recommendations;
        }


        // Format data for OpenAI
        const memberProfileData = {
            fitnessGoals: memberProfile.fitnessGoals,
            currentFitnessLevel: memberProfile.experienceLevel,
            healthConditions: memberProfile.healthConditions || [],
            preferredWorkoutTimes: [memberProfile.preferredTime || 'MORNING'],
            workoutPreferences: (memberProfile.additionalPreferences as any) || {},
        };

        const trainersData = recommendations.map((rec: any) => ({
            id: rec.trainerId,
            name: rec.trainer.user.name,
            specializations: rec.trainer.specializations.map(
                (s: any) => s.specialization
            ),
            experience: `${rec.trainer.experienceYears || 0} years`,
            rating: rec.trainer.rating,
            availability: rec.trainer.availability.map(
                (a: any) => `${a.dayOfWeek} ${a.startTime}-${a.endTime}`
            ),
            certifications: (rec.trainer.aiTrainerProfile?.specializations as any) || [],
            bio: rec.trainer.bio || '',
        })); try {
            // Get OpenAI enhanced recommendations
            const enhancedData = await generateEnhancedRecommendations(
                memberProfileData,
                trainersData
            );

            // Merge OpenAI insights with existing recommendations
            const enhanced = recommendations.map((rec: any) => {
                const aiData = enhancedData.find(
                    (e: any) => e.trainerId === rec.trainerId
                );

                return {
                    ...rec,
                    aiEnhanced: aiData
                        ? {
                            personalizedMessage: aiData.personalizedMessage,
                            workoutPlanSuggestion: aiData.workoutPlanSuggestion,
                            reasonForMatch: aiData.reasonForMatch,
                            estimatedTimeToGoal: aiData.estimatedTimeToGoal,
                        }
                        : null,
                };
            });

            return enhanced;
        } catch (error) {
            console.error('Failed to enhance recommendations with OpenAI:', error);
            // Return basic recommendations if OpenAI fails
            return recommendations;
        }
    }

    /**
     * Generate a personalized workout plan using OpenAI
     */
    static async generateWorkoutPlanForMember(
        memberId: string,
        trainerId: string,
        durationWeeks: number = 12
    ) {
        const [memberProfile, trainer] = await Promise.all([
            prisma.aIMemberProfile.findUnique({
                where: { memberId },
            }),
            prisma.trainer.findUnique({
                where: { id: trainerId },
                include: {
                    user: true,
                    specializations: true,
                    aiTrainerProfile: true,
                },
            }),
        ]);

        if (!memberProfile || !trainer) {
            throw new AppError(
                'Member profile or trainer not found',
                httpStatus.NOT_FOUND
            );
        }

        const memberData = {
            fitnessGoals: memberProfile.fitnessGoals,
            currentFitnessLevel: memberProfile.experienceLevel,
            healthConditions: memberProfile.healthConditions || [],
            preferredWorkoutTimes: [memberProfile.preferredTime || 'MORNING'],
            workoutPreferences: (memberProfile.additionalPreferences as any) || {},
        };

        const trainerData = {
            id: trainer.id,
            name: trainer.user.name,
            specializations: trainer.specializations.map((s) => s.specialization),
            experience: `${trainer.experienceYears || 0} years`,
            rating: trainer.rating,
            availability: [],
            certifications: (trainer.aiTrainerProfile?.specializations as any) || [],
            bio: trainer.bio || '',
        }; try {
            const workoutPlan = await generateWorkoutPlan(
                memberData,
                trainerData,
                durationWeeks
            );

            return {
                memberId,
                trainerId,
                durationWeeks,
                workoutPlan,
                generatedAt: new Date(),
            };
        } catch (error) {
            console.error('Failed to generate workout plan with OpenAI:', error);
            throw new AppError(
                'Failed to generate workout plan',
                httpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Analyze training data and get insights using OpenAI
     */
    static async analyzeTrainingDataInsights(trainerId?: string) {
        const whereClause = trainerId ? { trainerId } : {};

        const trainingData = await prisma.aITrainingData.findMany({
            where: whereClause,
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                trainer: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        if (trainingData.length === 0) {
            return {
                insights: 'No training data available for analysis',
                dataCount: 0,
            };
        }

        const formattedData = trainingData.map((data) => ({
            recommendationId: data.id,
            outcome: data.goalAchieved ? 'SUCCESS' : 'IN_PROGRESS',
            feedback: `Achievement: ${data.achievementPercentage}%, Duration: ${data.durationDays} days`,
            memberSatisfaction: data.memberSatisfaction || 0,
        }));

        try {
            const insights = await analyzeTrainingDataWithAI(formattedData);

            return {
                insights,
                dataCount: trainingData.length,
                analyzedAt: new Date(),
            };
        } catch (error) {
            console.error('Failed to analyze training data with OpenAI:', error);
            return {
                insights: 'Unable to generate AI insights at this time',
                dataCount: trainingData.length,
            };
        }
    }
}
