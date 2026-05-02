import { Role } from '@prisma/client';
import { Router } from 'express';
import { UserController } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { getUsersQuerySchema, toggleUserStatusSchema, updateUserProfileSchema, updateUserRoleSchema } from './user.validation';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { checkOwnership } from '../../middlewares/checkOwnerShip';
import { fileUploader } from '../../../helpers/fileUploader';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(getUsersQuerySchema),
  UserController.getAllUsers
);

 //   Get user by ID
 
router.get(
  '/:id',
  authenticate,
  checkOwnership(),
  UserController.getUserById
);


 //   Update user profile

router.put(
  '/:id',
  authenticate,
  checkOwnership(),
  validateRequest(updateUserProfileSchema),
  UserController.updateUserProfile
);


 //   Delete user

router.delete(
  '/:id',
  authenticate,
  authorize([Role.SUPER_ADMIN]),
  UserController.deleteUser
);


//    Get user statistics

router.get(
  '/stats',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  UserController.getUserStats
);


//   Activate/Deactivate user

router.put(
  '/:id/toggle-status',
  authenticate,
  authorize([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(toggleUserStatusSchema),
  UserController.toggleUserStatus
);


//    Update user role

router.put(
  '/:id/update-role',
  authenticate,
  authorize([Role.SUPER_ADMIN]),
  validateRequest(updateUserRoleSchema),
  UserController.updateUserRole
);


//    Upload user avatar

router.post(
  '/:id/upload-avatar',
  authenticate,
  checkOwnership(),
  fileUploader.upload.single('avatar'),
  UserController.uploadAvatar
);

export const userRoutes = router;