import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/middlewareAuth.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();
router.get('/dashboard-stats', authenticateToken, authorizeAdmin, getDashboardStats);
export default router;