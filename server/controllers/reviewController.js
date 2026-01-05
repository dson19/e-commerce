import asyncHandler from "../utils/asyncHandler";

const createReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const newReview = await addReview(userId, productId, rating, comment);
    res.status(201).json({
        success: true,
        data: newReview
    });
});

const getReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const reviews = await getReviewsByProductId(productId);
    res.status(200).json({
        success: true,
        data: reviews
    });
});
const deleteReviewController = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const deletedReview = await deleteReview(reviewId, userId);
    if (!deletedReview) {
        return res.status(404).json({
            success: false,
            message: "Review not found or you are not authorized to delete this review"
        });
    }
    res.status(200).json({
        success: true,
        message: "Review deleted successfully"
    });
});

export default{
    createReview,
    getReviews,
    deleteReviewController
};