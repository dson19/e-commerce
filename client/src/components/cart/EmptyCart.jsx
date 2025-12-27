import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const EmptyCart = () => {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 my-8">
      <ShoppingBag size={64} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h2>
      <p className="text-gray-500 mb-6">Hãy chọn thêm sản phẩm để mua sắm nhé</p>
      <Link to="/" className="px-6 py-3 bg-[#004535] text-white rounded-lg font-bold hover:bg-[#003528] transition-colors">
        Quay lại trang chủ
      </Link>
    </div>
  );
};

export default EmptyCart;