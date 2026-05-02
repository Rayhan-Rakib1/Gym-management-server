import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { MemberController } from './member.controller';
import { Role } from '@prisma/client';
import {
    createMemberSchema,
    updateMemberSchema,
    updateFitnessProfileSchema,
    assignTrainerSchema,
    updateMemberPlanSchema,
    renewMembershipSchema,
    getMembersQuerySchema,
} from './member.validation';

const router = Router();

//Get member statistics

router.get(
    '/stats',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    MemberController.getMemberStats
);

//Get members with expiring membership
router.get(
    '/expiring-soon',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    MemberController.getExpiringMembers
);

//Get all members
router.get(
    '/',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER]),
    validateRequest(getMembersQuerySchema),
    MemberController.getAllMembers
);

//Create new member
router.post(
    '/',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(createMemberSchema),
    MemberController.createMember
);

//Get member dashboard
router.get(
    '/:id/dashboard',
    authenticate,
    MemberController.getMemberDashboard
);

//Get member by ID
router.get(
    '/:id',
    authenticate,
    MemberController.getMemberById
);

//Update member
router.put(
    '/:id',
    authenticate,
    validateRequest(updateMemberSchema),
    MemberController.updateMember
);

//Delete member
router.delete(
    '/:id',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    MemberController.deleteMember
);

//Update fitness profile
router.put(
    '/:id/fitness-profile',
    authenticate,
    validateRequest(updateFitnessProfileSchema),
    MemberController.updateFitnessProfile
);

//Assign trainer to member
router.put(
    '/:id/assign-trainer',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(assignTrainerSchema),
    MemberController.assignTrainer
);

//Update member plan
router.put(
    '/:id/update-plan',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
    validateRequest(updateMemberPlanSchema),
    MemberController.updateMemberPlan
);

//Renew membership
router.post(
    '/:id/renew-membership',
    authenticate,
    validateRequest(renewMembershipSchema),
    MemberController.renewMembership
);

export const memberRoutes = router;