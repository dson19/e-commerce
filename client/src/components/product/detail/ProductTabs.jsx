import React from 'react';
import ProductReviews from './ProductReviews';

const ProductTabs = ({ activeTab, setActiveTab, reviewsCount, specs, productId }) => {
  return (
    <div>
      {/* ... (headers) */}

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {specs && Object.keys(specs).length > 0 && (
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${activeTab === 'specs'
              ? 'border-[#004535] text-[#004535]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            Thông số kỹ thuật
          </button>
        )}
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${activeTab === 'reviews'
            ? 'border-[#004535] text-[#004535]'
            : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          Đánh giá ({reviewsCount})
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${activeTab === 'policy'
            ? 'border-[#004535] text-[#004535]'
            : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          Chính sách bảo hành
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-gray-700 leading-relaxed text-sm md:text-base min-h-[200px]">
        {activeTab === 'specs' && specs && (
          <div className="animate-in fade-in duration-300">
            <table className="w-full text-left border-collapse">
              <tbody>
                {Object.entries(specs).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="p-3 border-b border-gray-100 font-medium text-gray-600 w-1/3 align-top">{key}</td>
                    <td className="p-3 border-b border-gray-100 text-gray-800 align-top whitespace-pre-line">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews productId={productId} />
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