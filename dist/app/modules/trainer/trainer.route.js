"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerRoutes = void 0;
const express_1 = require("express");
const trainer_controller_1 = require("./trainer.controller");
const trainer_validation_1 = require("./trainer.validation");
const auth_1 = require("../../middlewares/auth");
const authorize_1 = require("../../middlewares/authorize");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkOwnerShip_1 = require("../../middlewares/checkOwnerShip");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
//    Get all trainers
router.get('/', (0, validateRequest_1.validateRequest)(trainer_validation_1.getTrainersQuerySchema), trainer_controller_1.TrainerController.getAllTrainers);
//    Search trainers
router.get('/search', trainer_controller_1.TrainerController.searchTrainers);
//    Get trainer statistics
router.get('/stats', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), trainer_controller_1.TrainerController.getTrainerStats);
//    Create new trainer
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), (0, validateRequest_1.validateRequest)(trainer_validation_1.createTrainerSchema), trainer_controller_1.TrainerController.createTrainer);
//    Get trainer by ID
router.get('/:id', trainer_controller_1.TrainerController.getTrainerById);
//    Update trainer
router.put('/:id', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), (0, validateRequest_1.validateRequest)(trainer_validation_1.updateTrainerSchema), trainer_controller_1.TrainerController.updateTrainer);
//    Delete trainer
router.delete('/:id', auth_1.authenticate, (0, authorize_1.authorize)([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]), trainer_controller_1.TrainerController.deleteTrainer);
///    Get trainer dashboard
router.get('/:id/dashboard', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), trainer_controller_1.TrainerController.getTrainerDashboard);
//    Get trainer's members
router.get('/:id/members', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), trainer_controller_1.TrainerController.getTrainerMembers);
//    Get trainer reviews
router.get('/:id/reviews', trainer_controller_1.TrainerController.getTrainerReviews);
//    Get trainer performance
router.get('/:id/performance', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), trainer_controller_1.TrainerController.getTrainerPerformance);
//    Get trainer performance
router.get('/:id/performance', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), trainer_controller_1.TrainerController.getTrainerPerformance);
//    Add specialization
router.post('/:id/specializations', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), (0, validateRequest_1.validateRequest)(trainer_validation_1.addSpecializationSchema), trainer_controller_1.TrainerController.addSpecialization);
//    Update specialization
router.put('/:id/specializations/:specId', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), (0, validateRequest_1.validateRequest)(trainer_validation_1.updateSpecializationSchema), trainer_controller_1.TrainerController.updateSpecialization);
//    Delete specialization
router.delete('/:id/specializations/:specId', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), trainer_controller_1.TrainerController.deleteSpecialization);
//    Set availability
router.post('/:id/availability', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), (0, validateRequest_1.validateRequest)(trainer_validation_1.setAvailabilitySchema), trainer_controller_1.TrainerController.setAvailability);
//    Update availability
router.put('/:id/availability/:availId', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), (0, validateRequest_1.validateRequest)(trainer_validation_1.updateAvailabilitySchema), trainer_controller_1.TrainerController.updateAvailability);
//    Delete availability
router.delete('/:id/availability/:availId', auth_1.authenticate, (0, checkOwnerShip_1.checkOwnership)(), trainer_controller_1.TrainerController.deleteAvailability);
exports.trainerRoutes = router;
