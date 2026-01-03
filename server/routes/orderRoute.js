import express from 'express';
import orderController from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/middlewareAuth.js';

const router = express.Router();
router.use(authenticateToken); 

router.post('/', orderController.createOrder);
router.get('/orderHistory', orderController.getUserOrderHistory);
router.get('/:orderId', orderController.getOrderById);
export default router;