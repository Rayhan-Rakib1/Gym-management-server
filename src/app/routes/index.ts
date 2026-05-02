import express from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { userRoutes } from '../modules/user/user.route';
import { memberRoutes } from '../modules/member/member.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { trainerRoutes } from '../modules/trainer/trainer.route';
import { aiRoutes } from '../modules/AI/ai.route';
import { PlanRoutes } from '../modules/membership/membership.route';
import { ClassRoutes } from '../modules/Class/class.route';
import { ProgressRoutes } from '../modules/ProgressTracking/progress.route';
import { attendanceRoutes } from '../modules/attendance/attendance.route';
import { BookingRoutes } from '../modules/Booking/booking.route';
import { WorkoutPlanRoutes } from '../modules/Workout/workout.route';
import { ReviewRoutes } from '../modules/Review/review.route';
// import { SettingsRoutes } from '../modules/Settings/settings.route'; // TODO: Fix settings service to match schema

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRoutes
    },
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/member',
        route: memberRoutes
    },
    {
        path: '/trainer',
        route: trainerRoutes
    },
    {
        path: '/payment',
        route: paymentRoutes
    },
    {
        path: '/plan',
        route: PlanRoutes
    },
    {
        path: '/class',
        route: ClassRoutes
    },
    {
        path: '/booking',
        route: BookingRoutes
    },
    {
        path: '/progress',
        route: ProgressRoutes
    },
    {
        path: '/attendance',
        route: attendanceRoutes
    },
    {
        path: '/plan',
        route: PlanRoutes
    },
    {
        path: '/workout',
        route: WorkoutPlanRoutes
    },
    {
        path: '/review',
        route: ReviewRoutes
    },
    // {
    //     path: '/settings',
    //     route: SettingsRoutes
    // },
    {
        path: '/ai',
        route: aiRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;