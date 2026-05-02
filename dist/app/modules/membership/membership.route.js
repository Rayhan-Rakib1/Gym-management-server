"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRoutes = void 0;
const express_1 = require("express");
const membership_validation_1 = require("./membership.validation");
const validateRequest_1 = require("../../middlewares/validateRequest");
const membership_controller_1 = require("./membership.controller");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
//    Get all membership plans
router.get('/', (0, validateRequest_1.validateRequest)(membership_validation_1.getPlansQuerySchema), membership_controller_1.PlanController.getAllPlans);
// Get active plans only
router.get('/active', membership_controller_1.PlanController.getActivePlans);
// Get popular plans
router.get('/popular', membership_controller_1.PlanController.getPopularPlans);
//    Get plan statistics
router.get('/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), membership_controller_1.PlanController.getPlanStats);
// Compare plans
router.post('/compare', membership_controller_1.PlanController.comparePlans);
//   Create new plan
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(membership_validation_1.createPlanSchema), membership_controller_1.PlanController.createPlan);
//    Get plan by ID
router.get('/:id', membership_controller_1.PlanController.getPlanById);
//   Update plan
router.put('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(membership_validation_1.updatePlanSchema), membership_controller_1.PlanController.updatePlan);
//   Toggle plan status
router.patch('/:id/toggle-status', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(membership_validation_1.togglePlanStatusSchema), membership_controller_1.PlanController.togglePlanStatus);
//   Delete plan
router.delete('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), membership_controller_1.PlanController.deletePlan);
//   Get plan members
router.get('/:id/members', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), membership_controller_1.PlanController.getPlanMembers);
//   Calculate plan savings
router.get('/:id/savings', membership_controller_1.PlanController.calculateSavings);
exports.PlanRoutes = router;
