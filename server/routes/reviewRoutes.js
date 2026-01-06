import reviewController from "../controllers/reviewController.js";
import express from "express";
import { authenticateToken } from "../middleware/middlewareAuth.js";

const router = express.Router();
router.get("/products/:productId/reviews", reviewController.getReviews);
router.post("/products/:productId/reviews", authenticateToken, reviewController.createReview);
router.delete("/reviews/:reviewId", authenticateToken, reviewController.deleteReviewController);
export default router;