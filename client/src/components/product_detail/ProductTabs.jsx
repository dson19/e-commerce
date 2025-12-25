import React from 'react';

const ProductTabs = ({ activeTab, setActiveTab, description, reviewsCount }) => {
  return (
    <div>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('description')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'description'
              ? 'border-[#004535] text-[#004535]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Mô tả sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'reviews'
              ? 'border-[#004535] text-[#004535]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Đánh giá ({reviewsCount})
        </button>
        <button
           onClick={() => setActiveTab('policy')}
           className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${
             activeTab === 'policy'
               ? 'border-[#004535] text-[#004535]'
               : 'border-transparent text-gray-500 hover:text-gray-800'
           }`}
        >
           Chính sách bảo hành
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-gray-700 leading-relaxed text-sm md:text-base min-h-[200px]">
        {activeTab === 'description' && (
          <div className="animate-in fade-in duration-300">
             <p className="mb-4">{description}</p>
             <p>Nội dung mô tả chi tiết hơn sẽ nằm ở đây. Bạn có thể render HTML hoặc các đoạn văn bản dài.</p>
             {/* Giả lập nội dung dài */}
             <ul className="list-disc pl-5 space-y-2 mt-4 text-gray-600">
                <li>Màn hình Super Retina XDR sắc nét.</li>
                <li>Chip xử lý mạnh mẽ nhất thế giới smartphone.</li>
                <li>Camera chuyên nghiệp chuẩn studio.</li>
                <li>Thời lượng pin cả ngày dài.</li>
             </ul>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in duration-300">
             <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-gray-500 mb-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                <button className="px-6 py-2 border border-[#004535] text-[#004535] rounded-full hover:bg-[#004535] hover:text-white transition-all font-medium text-sm">
                   Viết đánh giá ngay
                </button>
             </div>
          </div>
        )}

        {activeTab === 'policy' && (
           <div className="animate-in fade-in duration-300 space-y-4">
              <p><strong>Bảo hành chính hãng:</strong> 12 tháng tại trung tâm bảo hành ủy quyền.</p>
              <p><strong>Đổi trả:</strong> 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;