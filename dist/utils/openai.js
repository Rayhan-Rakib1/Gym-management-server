"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTrainingData = exports.generateWorkoutPlan = exports.generateEnhancedRecommendations = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
/**
 * Generate enhanced AI recommendations using OpenAI
 */
const generateEnhancedRecommendations = async (memberProfile, matchedTrainers) => {
    try {
        const openaiApiKey = config_1.default.openai_api_key;
        if (!openaiApiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        const prompt = buildRecommendationPrompt(memberProfile, matchedTrainers);
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional fitness consultant AI. Generate personalized trainer recommendations based on member profiles and trainer capabilities. Provide actionable, motivating, and professional advice.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 2000,
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openaiApiKey}`,
            },
        });
        const aiResponse = response.data.choices[0].message.content;
        return parseOpenAIResponse(aiResponse, matchedTrainers);
    }
    catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        // Return fallback recommendations if OpenAI fails
        return generateFallbackRecommendations(memberProfile, matchedTrainers);
    }
};
exports.generateEnhancedRecommendations = generateEnhancedRecommendations;
/**
 * Build the prompt for OpenAI
 */
const buildRecommendationPrompt = (memberProfile, trainers) => {
    const trainerDetails = trainers
        .map((trainer, index) => `Trainer ${index + 1}:
- ID: ${trainer.id}
- Name: ${trainer.name}
- Specializations: ${trainer.specializations.join(', ')}
- Experience: ${trainer.experience}
- Rating: ${trainer.rating}/5
- Availability: ${trainer.availability.join(', ')}
- Certifications: ${trainer.certifications.join(', ')}
${trainer.bio ? `- Bio: ${trainer.bio}` : ''}`)
        .join('\n\n');
    return `
Member Profile:
- Fitness Goals: ${memberProfile.fitnessGoals.join(', ')}
- Current Fitness Level: ${memberProfile.currentFitnessLevel}
- Health Conditions: ${memberProfile.healthConditions.length > 0 ? memberProfile.healthConditions.join(', ') : 'None'}
- Preferred Workout Times: ${memberProfile.preferredWorkoutTimes.join(', ')}
- Workout Preferences: ${JSON.stringify(memberProfile.workoutPreferences)}

Available Trainers:
${trainerDetails}

Based on the member's profile and the available trainers, please provide personalized recommendations for each trainer in the following JSON format:

{
  "recommendations": [
    {
      "trainerId": "trainer-id-here",
      "personalizedMessage": "A warm, motivating message explaining why this trainer is a great match (2-3 sentences)",
      "workoutPlanSuggestion": "Brief overview of the recommended workout plan approach (2-3 sentences)",
      "reasonForMatch": "Specific reasons why this trainer matches the member's goals and preferences (2-3 sentences)",
      "estimatedTimeToGoal": "Realistic timeline estimate (e.g., '3-6 months', '2-3 months')"
    }
  ]
}

Important:
- Provide recommendations for all ${trainers.length} trainers
- Be specific about why each trainer matches the member's needs
- Consider health conditions when suggesting workout plans
- Be motivating and professional in tone
- Focus on achievable goals and realistic timelines
`;
};
/**
 * Parse OpenAI response into structured recommendations
 */
const parseOpenAIResponse = (aiResponse, trainers) => {
    try {
        // Extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }
        const parsed = JSON.parse(jsonMatch[0]);
        const recommendations = parsed.recommendations || [];
        // Validate that we have recommendations for all trainers
        if (recommendations.length !== trainers.length) {
            console.warn(`Expected ${trainers.length} recommendations, got ${recommendations.length}`);
        }
        return recommendations;
    }
    catch (error) {
        console.error('Failed to parse OpenAI response:', error);
        return generateFallbackRecommendations({}, trainers);
    }
};
/**
 * Generate fallback recommendations if OpenAI fails
 */
const generateFallbackRecommendations = (memberProfile, trainers) => {
    return trainers.map(trainer => ({
        trainerId: trainer.id,
        personalizedMessage: `${trainer.name} is an experienced trainer with ${trainer.experience} of expertise and a ${trainer.rating}/5 rating. They specialize in ${trainer.specializations.slice(0, 2).join(' and ')}, which aligns well with your fitness journey.`,
        workoutPlanSuggestion: `Your personalized workout plan will combine ${trainer.specializations[0]} training with progressive overload principles, tailored to your current fitness level and goals.`,
        reasonForMatch: `This trainer's specializations in ${trainer.specializations.join(', ')} make them an excellent match for your goals. Their availability during ${trainer.availability.slice(0, 2).join(' and ')} also fits your preferred workout times.`,
        estimatedTimeToGoal: '3-6 months',
    }));
};
/**
 * Generate workout plan suggestions using OpenAI
 */
const generateWorkoutPlan = async (memberProfile, trainerProfile, durationWeeks = 12) => {
    try {
        const openaiApiKey = config_1.default.openai_api_key;
        if (!openaiApiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        const prompt = `
Create a ${durationWeeks}-week workout plan for a member with the following profile:

Member Profile:
- Fitness Goals: ${memberProfile.fitnessGoals.join(', ')}
- Current Fitness Level: ${memberProfile.currentFitnessLevel}
- Health Conditions: ${memberProfile.healthConditions.length > 0 ? memberProfile.healthConditions.join(', ') : 'None'}
- Workout Preferences: ${JSON.stringify(memberProfile.workoutPreferences)}

Trainer Profile:
- Name: ${trainerProfile.name}
- Specializations: ${trainerProfile.specializations.join(', ')}
- Experience: ${trainerProfile.experience}

Please provide a structured workout plan including:
1. Weekly schedule overview
2. Progression strategy
3. Key exercises by phase
4. Recovery and rest days
5. Nutrition tips (brief)
6. Progress milestones

Format the plan in a clear, easy-to-follow structure.
`;
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert fitness trainer creating personalized workout plans. Be specific, practical, and motivating.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 2500,
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openaiApiKey}`,
            },
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        return generateFallbackWorkoutPlan(memberProfile, trainerProfile, durationWeeks);
    }
};
exports.generateWorkoutPlan = generateWorkoutPlan;
/**
 * Generate fallback workout plan
 */
const generateFallbackWorkoutPlan = (memberProfile, trainerProfile, durationWeeks) => {
    return `
# ${durationWeeks}-Week Personalized Workout Plan

## Overview
This plan is designed for ${memberProfile.currentFitnessLevel} level focusing on ${memberProfile.fitnessGoals.join(', ')}.

## Weekly Structure
- **Week 1-4:** Foundation Phase
  - 3-4 sessions per week
  - Focus on form and technique
  - Building baseline fitness

- **Week 5-8:** Development Phase
  - 4-5 sessions per week
  - Increased intensity and volume
  - Progressive overload introduction

- **Week 9-${durationWeeks}:** Advanced Phase
  - 5-6 sessions per week
  - Peak intensity training
  - Goal-specific work

## Key Training Areas
Based on trainer specialization: ${trainerProfile.specializations.join(', ')}

## Recovery
- 1-2 rest days per week
- Active recovery recommended
- Adequate sleep (7-9 hours)

## Progress Tracking
- Weekly measurements
- Performance benchmarks
- Goal reassessment every 4 weeks

Your trainer ${trainerProfile.name} will customize this plan based on your progress and feedback.
`;
};
/**
 * Analyze training data and provide insights using OpenAI
 */
const analyzeTrainingData = async (trainingData) => {
    try {
        const openaiApiKey = config_1.default.openai_api_key;
        if (!openaiApiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        const prompt = `
Analyze the following training outcome data and provide insights:

${trainingData
            .map((data, index) => `
Training Session ${index + 1}:
- Recommendation ID: ${data.recommendationId}
- Outcome: ${data.outcome}
- Feedback: ${data.feedback}
- Member Satisfaction: ${data.memberSatisfaction}/5
`)
            .join('\n')}

Please provide:
1. Key patterns in successful recommendations
2. Areas for improvement
3. Member satisfaction trends
4. Recommendations for algorithm optimization
5. Success factors to emphasize

Be concise and actionable.
`;
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a data analyst specializing in fitness program outcomes. Provide actionable insights from training data.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openaiApiKey}`,
            },
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        return 'Unable to generate AI insights at this time. Please review the training data manually.';
    }
};
exports.analyzeTrainingData = analyzeTrainingData;
