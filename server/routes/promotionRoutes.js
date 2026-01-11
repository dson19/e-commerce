import express from 'express';
import { 
  getPromotions, 
  createPromotion,
  validatePromotion,
  getCategoriesForAdmin,
  getBrandsForAdmin,
  searchProductsForAdmin,
  getAllPromotionsForAdmin
} from '../controllers/promotionController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/middlewareAuth.js';

const router = express.Router();

// Public routes (không cần auth)
router.get('/', getPromotions); 
router.post('/validate', validatePromotion);

// Admin routes (cần auth + admin role)
router.get('/admin/all', authenticateToken, authorizeAdmin, getAllPromotionsForAdmin);
router.post('/admin/create', authenticateToken, authorizeAdmin, createPromotion);
router.get('/admin/categories', authenticateToken, authorizeAdmin, getCategoriesForAdmin);
router.get('/admin/brands', authenticateToken, authorizeAdmin, getBrandsForAdmin);
router.get('/admin/products/search', authenticateToken, authorizeAdmin, searchProductsForAdmin);

export default router;