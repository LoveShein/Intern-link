import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
