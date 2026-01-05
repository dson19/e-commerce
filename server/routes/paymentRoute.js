import express from 'express';
import paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.post('/casso-webhook',paymentController.handleCassoWebhook);
router.get('')
export default router;
