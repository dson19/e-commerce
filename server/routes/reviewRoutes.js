import reviewController from "../controllers/reviewController";
import express from "express";

const router = express.Router();
router.get("/product/:id/reviews", reviewController.getReviewsByProductId);
router.post("/product/:productId/review", reviewController.createReview);
router.delete("/review/:reviewId", reviewController.deleteReviewController);