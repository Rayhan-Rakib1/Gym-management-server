import { Router } from 'express';
import { createPlanSchema, getPlansQuerySchema, togglePlanStatusSchema, updatePlanSchema } from './membership.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { PlanController } from './membership.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { Role } from '@prisma/client';


const router = Router();


//    Get all membership plans
router.get(
  '/',
  validateRequest(getPlansQuerySchema),
  PlanController.getAllPlans
);


// Get active plans only
router.get('/active', PlanController.getActivePlans);

// Get popular plans
router.get('/popular', PlanController.getPopularPlans);

//    Get plan statistics
router.get(
  '/stats',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  PlanController.getPlanStats
);

// Compare plans
router.post('/compare', PlanController.comparePlans);

//   Create new plan
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(createPlanSchema),
  PlanController.createPlan
);

//    Get plan by ID
router.get('/:id', PlanController.getPlanById);

//   Update plan
router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(updatePlanSchema),
  PlanController.updatePlan
);
//   Toggle plan status
router.patch(
  '/:id/toggle-status',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(togglePlanStatusSchema),
  PlanController.togglePlanStatus
);
//   Delete plan
router.delete(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  PlanController.deletePlan
);

//   Get plan members
router.get(
  '/:id/members',
    authenticate,
    authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  PlanController.getPlanMembers
);
//   Calculate plan savings
router.get('/:id/savings', PlanController.calculateSavings);

export const PlanRoutes = router;