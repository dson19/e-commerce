import express from 'express';
import cartController from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/middlewareAuth.js';

const router = express.Router();

router.use(authenticateToken); // Protect all cart routes

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/remove/:variantId', cartController.removeFromCart);
router.put('/update', cartController.updateQuantity);
router.delete('/clear', cartController.clearCart);

export default router;
