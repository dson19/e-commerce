import reviewController from "../controllers/reviewController";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/product/:productId/reviews", reviewController.getReviews);
router.post("/product/:productId/review",verifyToken, reviewController.createReview);
router.delete("/reviews/:reviewId",verifyToken, reviewController.deleteReviewController);
export default router;