// src/components/product/ProductTabs.jsx
import React from 'react';

const ProductTabs = ({ activeTab, setActiveTab, description, reviewsCount }) => {
  return (
    <div className="mt-4 bg-white shadow-xl rounded-b-xl p-6 md:p-8">
      <div className="flex space-x-8 border-b border-gray-200 mb-6">
        <TabButton name="Mô tả chi tiết" tabId="description" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Thông số kỹ thuật" tabId="specs" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name={`Đánh giá (${reviewsCount})`} tabId="reviews" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="py-4 text-gray-700 leading-relaxed">
        {activeTab === 'description' && (
          <div>
            <h3 className="text-xl font-bold mb-3">Thông tin chi tiết</h3>
            <p>{description}</p>
          </div>
        )}
        {activeTab === 'specs' && (
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr><th className="py-2 border-b">Màn hình</th><td className="py-2 border-b">Super Retina XDR, 6.7 inch</td></tr>
              <tr><th className="py-2 border-b">Chip</th><td className="py-2 border-b">A17 Pro</td></tr>
              <tr><th className="py-2 border-b">Camera sau</th><td className="py-2 border-b">48MP + 12MP + 12MP (Zoom quang 5x)</td></tr>
              <tr><th className="py-2">Pin</th><td className="py-2">Hỗ trợ sạc nhanh 27W</td></tr>
            </tbody>
          </table>
        )}
        {activeTab === 'reviews' && (
          <p>Đây là nơi hiển thị danh sách đánh giá của khách hàng.</p>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ name, tabId, activeTab, setActiveTab }) => (
  <button
    className={`pb-3 text-lg font-medium transition-colors ${
      activeTab === tabId ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
    }`}
    onClick={() => setActiveTab(tabId)}
  >
    {name}
  </button>
);

export default ProductTabs;