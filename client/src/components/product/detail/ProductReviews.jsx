import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';

const ProductReviews = () => {
    // Mock Data for UI (Text only)
    const [mockReviews] = useState([
        {
            id: 1,
            user: "Nguyễn Văn A",
            avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random",
            date: "20/12/2025",
            comment: "Sản phẩm tuyệt vời, giao hàng nhanh, đóng gói cẩn thận. Màu cam vũ trụ nhìn bên ngoài đẹp hơn trong ảnh nhiều!",
            helpful: 12
        },
        {
            id: 2,
            user: "Trần Thị B",
            avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=random",
            date: "18/12/2025",
            comment: "Máy dùng mượt, pin trâu. Tuy nhiên giao hàng hơi chậm một chút so với dự kiến.",
            helpful: 5
        },
        {
            id: 3,
            user: "Lê Hoàng C",
            avatar: "https://ui-avatars.com/api/?name=Le+Hoang+C&background=random",
            date: "15/12/2025",
            comment: "Nhân viên tư vấn nhiệt tình. Sẽ ủng hộ shop dài dài.",
            helpful: 8
        }
    ]);

    const [showForm, setShowForm] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Comments Header & Action */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-2xl gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Hỏi đáp & Bình luận</h3>
                    <p className="text-gray-500 text-sm mt-1">{mockReviews.length} bình luận</p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2.5 bg-[#004535] text-white rounded-lg font-medium hover:bg-[#00332a] transition-colors shadow-lg shadow-[#004535]/20 flex items-center gap-2"
                >
                    <MessageSquare size={18} />
                    Viết bình luận
                </button>
            </div>

            {/* 2. Write Comment Form (Collapsible) */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Gửi bình luận của bạn</h3>
                    <div className="space-y-4">
                        <textarea
                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004535]/20 focus:border-[#004535] transition-all min-h-[100px] text-sm"
                            placeholder="Mời bạn chia sẻ cảm nhận hoặc đặt câu hỏi về sản phẩm..."
                        ></textarea>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm">Hủy</button>
                            <button className="px-6 py-2 bg-[#004535] text-white rounded-lg font-medium hover:bg-[#00332a] text-sm flex items-center gap-2">
                                <Send size={16} /> Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Comments List */}
            <div className="space-y-6">
                {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex gap-4">
                            <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{review.user}</h4>
                                    <span className="text-xs text-gray-400">{review.date}</span>
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                    {review.comment}
                                </p>

                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#004535] transition-colors">
                                        <ThumbsUp size={14} /> Thích ({review.helpful})
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#004535] transition-colors">
                                        <MessageSquare size={14} /> Trả lời
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dummy */}
            <div className="flex justify-center pt-2">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Xem thêm bình luận
                </button>
            </div>
        </div>
    );
};

export default ProductReviews;
