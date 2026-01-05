import express from 'express';
import { signUp, signIn, signOut, getMe, getAddresses, updateAddress, addAddress, deleteAddress } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/middlewareAuth.js';
import { verifyAccount, sendForgotPasswordOTP, verifyForgotOTP, resetPassword, updateProfile } from '../controllers/authController.js';
const router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.post('/signOut', signOut);
router.post('/verify-otp', verifyAccount);
router.get('/me', authenticateToken, getMe);
router.post('/forgot-password', sendForgotPasswordOTP);
router.post('/verify-forgot-otp', verifyForgotOTP);
router.post('/reset-password', resetPassword);
router.put('/profile', authenticateToken, updateProfile);
router.get('/addresses', authenticateToken, getAddresses);
router.post('/addresses', authenticateToken, addAddress);
router.put('/addresses/:addressId', authenticateToken, updateAddress);
router.delete('/addresses/:addressId', authenticateToken, deleteAddress);

export default router;
