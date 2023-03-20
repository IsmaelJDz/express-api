import express from 'express';
import validateResource from '../middleware/validateResourse';
import { resetPasswordSchema } from '../schema/user.schema';
import {
  createUserSchema,
  forgotPasswordSchema,
  verifyUserSchema,
} from '../schema/user.schema';
import {
  createUserHandler,
  forgotPasswordHandler,
  getCurrentUserHandler,
  resetPasswordHandler,
  verifyUserHandler,
} from '../controller/user.controller';

const router = express.Router();

router.post(
  '/api/users',
  validateResource(createUserSchema),
  createUserHandler
);

router.post(
  '/api/users/verify/:id/:verificationCode',
  validateResource(verifyUserSchema),
  verifyUserHandler
);

router.post(
  '/api/users/forgot-password',
  validateResource(forgotPasswordSchema),
  forgotPasswordHandler
);

router.post(
  '/api/users/reset-password/:id/:passwordResetCode',
  validateResource(resetPasswordSchema),
  resetPasswordHandler
);

router.get('/api/users/me', getCurrentUserHandler);

export default router;
