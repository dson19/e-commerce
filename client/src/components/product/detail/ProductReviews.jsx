import React, { useState } from 'react'; // Bỏ useEffect và useCallback vì không fetch ở đây nữa
import { ThumbsUp, MessageSquare, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { reviewService } from '../../../services/api';
import { toast } from 'sonner';
import { Trash2 as TrashIcon } from 'lucide-react';

const ProductReviews = ({ productId, reviews = [], onReviewChange }) => {
    const { user, isAuthenticated } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitReview = async () => {
        if (!comment.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            setSubmitting(true);
            const response = await reviewService.addReview(productId, { rating, comment });
            if (response.data.success) {
                toast.success("Đánh giá đã được gửi thành công!");
                setComment("");
                setShowForm(false);
                if (onReviewChange) {
                    onReviewChange();
                }
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

const handleDeleteReview = (reviewId) => {
        // 1. Hiện toast xác nhận (Thay thế cho window.confirm)
        toast("Bạn có chắc chắn muốn xóa đánh giá này?", {
            action: {
                label: "Xóa ngay",
                // 2. Chỉ chạy logic xóa khi người dùng bấm vào nút Action này
                onClick: () => {
                    toast.promise(
                        reviewService.deleteReview(reviewId),
                        {
                            loading: "Đang xóa đánh giá...",
                            success: () => {
                                // Cập nhật lại danh sách sau khi xóa thành công
                                if (onReviewChange) {
                                    onReviewChange();
                                }
                                return "Đánh giá đã được xóa thành công!";
                            },
                            error: (error) => error.response?.data?.message || "Không thể xóa đánh giá"
                        }
                    );
                },
            },
            cancel: {
                label: "Hủy bỏ",
            },
            duration: 5000, // Thời gian chờ xác nhận
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Comments Header & Action */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-2xl gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Hỏi đáp & Bình luận</h3>
                    <p className="text-gray-500 text-sm mt-1">{reviews.length} đánh giá</p>
                </div>

                <button
                    onClick={() => {
                        if (!isAuthenticated) {
                            toast.error("Vui lòng đăng nhập để viết đánh giá");
                            return;
                        }
                        setShowForm(!showForm);
                    }}
                    className="px-6 py-2.5 bg-[#004535] text-white rounded-lg font-medium hover:bg-[#00332a] transition-colors shadow-lg shadow-[#004535]/20 flex items-center gap-2"
                >
                    <MessageSquare size={18} />
                    Viết bình luận
                </button>
            </div>

            {/* 2. Write Comment Form */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Gửi đánh giá của bạn</h3>

                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm font-medium">Đánh giá:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-xl focus:outline-none transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004535]/20 focus:border-[#004535] transition-all min-h-[100px] text-sm"
                            placeholder="Mời bạn chia sẻ cảm nhận về sản phẩm..."
                            disabled={submitting}
                        ></textarea>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={submitting}
                                className="px-6 py-2 bg-[#004535] text-white rounded-lg font-medium hover:bg-[#00332a] text-sm flex items-center gap-2 disabled:opacity-70"
                            >
                                {submitting ? 'Đang gửi...' : <><Send size={16} /> Gửi</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Comments List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.review_id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex gap-4">
                                <img
                                    src={review.avatar_url || `https://ui-avatars.com/api/?name=${review.full_name || 'User'}&background=random`}
                                    alt={review.full_name}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">{review.full_name || `Người dùng ẩn danh ${review.user_id}`}</h4>
                                            <div className="flex text-yellow-400 text-xs my-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < review.rating ? "" : "text-gray-200"}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                        {review.comment}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#004535] transition-colors">
                                            <ThumbsUp size={14} /> Thích
                                        </button>

                                        {isAuthenticated && user && user.id === review.user_id && (
                                            <button
                                                onClick={() => handleDeleteReview(review.review_id)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={14} /> Xóa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {reviews.length > 5 && (
                <div className="flex justify-center pt-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Xem thêm bình luận
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;