import express from 'express';
import { signUp, signIn, signOut, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/middlewareAuth.js';
import { verifyAccount } from '../controllers/authController.js';
const router = express.Router();

router.post('/signUp',signUp);
router.post('/signIn',signIn);
router.post('/signOut',signOut);
router.post('/verify-otp', verifyAccount);
router.get('/me', authenticateToken, getMe);
export default router;
