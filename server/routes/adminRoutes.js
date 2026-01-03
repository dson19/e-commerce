import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/middlewareAuth.js';
import { getDashboardStats, getUsers, updateInventory } from '../controllers/adminController.js';

const router = express.Router();
router.get('/dashboard-stats', authenticateToken, authorizeAdmin, getDashboardStats);
router.get('/users', authenticateToken, authorizeAdmin, getUsers);
router.put('/inventory/:variantId', authenticateToken, authorizeAdmin, updateInventory);
export default router;