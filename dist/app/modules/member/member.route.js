"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const member_controller_1 = require("./member.controller");
const client_1 = require("@prisma/client");
const member_validation_1 = require("./member.validation");
const router = (0, express_1.Router)();
//Get member statistics
router.get('/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), member_controller_1.MemberController.getMemberStats);
//Get members with expiring membership
router.get('/expiring-soon', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), member_controller_1.MemberController.getExpiringMembers);
//Get all members
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TRAINER]), (0, validateRequest_1.validateRequest)(member_validation_1.getMembersQuerySchema), member_controller_1.MemberController.getAllMembers);
//Create new member
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(member_validation_1.createMemberSchema), member_controller_1.MemberController.createMember);
//Get member dashboard
router.get('/:id/dashboard', auth_1.authenticate, member_controller_1.MemberController.getMemberDashboard);
//Get member by ID
router.get('/:id', auth_1.authenticate, member_controller_1.MemberController.getMemberById);
//Update member
router.put('/:id', auth_1.authenticate, (0, validateRequest_1.validateRequest)(member_validation_1.updateMemberSchema), member_controller_1.MemberController.updateMember);
//Delete member
router.delete('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), member_controller_1.MemberController.deleteMember);
//Update fitness profile
router.put('/:id/fitness-profile', auth_1.authenticate, (0, validateRequest_1.validateRequest)(member_validation_1.updateFitnessProfileSchema), member_controller_1.MemberController.updateFitnessProfile);
//Assign trainer to member
router.put('/:id/assign-trainer', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(member_validation_1.assignTrainerSchema), member_controller_1.MemberController.assignTrainer);
//Update member plan
router.put('/:id/update-plan', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(member_validation_1.updateMemberPlanSchema), member_controller_1.MemberController.updateMemberPlan);
//Renew membership
router.post('/:id/renew-membership', auth_1.authenticate, (0, validateRequest_1.validateRequest)(member_validation_1.renewMembershipSchema), member_controller_1.MemberController.renewMembership);
exports.memberRoutes = router;
