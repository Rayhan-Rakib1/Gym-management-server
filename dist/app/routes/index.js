"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/auth/auth.route");
const user_route_1 = require("../modules/user/user.route");
const member_route_1 = require("../modules/member/member.route");
const payment_route_1 = require("../modules/payment/payment.route");
const trainer_route_1 = require("../modules/trainer/trainer.route");
const ai_route_1 = require("../modules/AI/ai.route");
const membership_route_1 = require("../modules/membership/membership.route");
const class_route_1 = require("../modules/Class/class.route");
const progress_route_1 = require("../modules/ProgressTracking/progress.route");
const attendance_route_1 = require("../modules/attendance/attendance.route");
const booking_route_1 = require("../modules/Booking/booking.route");
const workout_route_1 = require("../modules/Workout/workout.route");
const review_route_1 = require("../modules/Review/review.route");
// import { SettingsRoutes } from '../modules/Settings/settings.route'; // TODO: Fix settings service to match schema
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.authRoutes
    },
    {
        path: '/user',
        route: user_route_1.userRoutes
    },
    {
        path: '/member',
        route: member_route_1.memberRoutes
    },
    {
        path: '/trainer',
        route: trainer_route_1.trainerRoutes
    },
    {
        path: '/payment',
        route: payment_route_1.paymentRoutes
    },
    {
        path: '/plan',
        route: membership_route_1.PlanRoutes
    },
    {
        path: '/class',
        route: class_route_1.ClassRoutes
    },
    {
        path: '/booking',
        route: booking_route_1.BookingRoutes
    },
    {
        path: '/progress',
        route: progress_route_1.ProgressRoutes
    },
    {
        path: '/attendance',
        route: attendance_route_1.attendanceRoutes
    },
    {
        path: '/plan',
        route: membership_route_1.PlanRoutes
    },
    {
        path: '/workout',
        route: workout_route_1.WorkoutPlanRoutes
    },
    {
        path: '/review',
        route: review_route_1.ReviewRoutes
    },
    // {
    //     path: '/settings',
    //     route: SettingsRoutes
    // },
    {
        path: '/ai',
        route: ai_route_1.aiRoutes
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
