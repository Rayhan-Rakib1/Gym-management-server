import { Router } from 'express';
import { TrainerController } from './trainer.controller';
import {
  createTrainerSchema,
  updateTrainerSchema,
  addSpecializationSchema,
  updateSpecializationSchema,
  setAvailabilitySchema,
  updateAvailabilitySchema,
  getTrainersQuerySchema,
} from './trainer.validation';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import { checkOwnership } from '../../middlewares/checkOwnerShip';
import { Role } from '@prisma/client';

const router = Router();


//    Get all trainers
router.get(
  '/',
  validateRequest(getTrainersQuerySchema),
  TrainerController.getAllTrainers
);

//    Search trainers
router.get('/search', TrainerController.searchTrainers);


//    Get trainer statistics
router.get(
  '/stats',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  TrainerController.getTrainerStats
);

//    Create new trainer
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(createTrainerSchema),
  TrainerController.createTrainer
);

//    Get trainer by ID
router.get('/:id', TrainerController.getTrainerById);


//    Update trainer
router.put(
  '/:id',
  authenticate,
  checkOwnership(),
  validateRequest(updateTrainerSchema),
  TrainerController.updateTrainer
);

//    Delete trainer
router.delete(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  TrainerController.deleteTrainer
);

///    Get trainer dashboard
router.get(
  '/:id/dashboard',
  authenticate,
  checkOwnership(),
  TrainerController.getTrainerDashboard
);

//    Get trainer's members
router.get(
  '/:id/members',
  authenticate,
  checkOwnership(),
  TrainerController.getTrainerMembers
);

//    Get trainer reviews
router.get('/:id/reviews', TrainerController.getTrainerReviews);

//    Get trainer performance
router.get(
  '/:id/performance',
  authenticate,
  checkOwnership(),
  TrainerController.getTrainerPerformance
);

//    Get trainer performance
router.get(
  '/:id/performance',
  authenticate,
  checkOwnership(),
  TrainerController.getTrainerPerformance
);

//    Add specialization
router.post(
  '/:id/specializations',
  authenticate,
  checkOwnership(),
  validateRequest(addSpecializationSchema),
  TrainerController.addSpecialization
);

//    Update specialization
router.put(
  '/:id/specializations/:specId',
  authenticate,
  checkOwnership(),
  validateRequest(updateSpecializationSchema),
  TrainerController.updateSpecialization
);

//    Delete specialization
router.delete(
  '/:id/specializations/:specId',
  authenticate,
  checkOwnership(),
  TrainerController.deleteSpecialization
);

//    Set availability
router.post(
  '/:id/availability',
  authenticate,
  checkOwnership(),
  validateRequest(setAvailabilitySchema),
  TrainerController.setAvailability
);

//    Update availability
router.put(
  '/:id/availability/:availId',
  authenticate,
  checkOwnership(),
  validateRequest(updateAvailabilitySchema),
  TrainerController.updateAvailability
);

//    Delete availability
router.delete(
  '/:id/availability/:availId',
  authenticate,
  checkOwnership(),
  TrainerController.deleteAvailability
);

export const trainerRoutes = router;