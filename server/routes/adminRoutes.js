import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/middlewareAuth.js';
import { getDashboardStats, getUsers, updateInventory, getOrders, updateOrderStatus, getOrderDetails } from '../controllers/adminController.js';

const router = express.Router();
router.use(authenticateToken, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);
router.put('/orders/:orderId', updateOrderStatus);
router.put('/inventory/:variantId', updateInventory);

export default router;