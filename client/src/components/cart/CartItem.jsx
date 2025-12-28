import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

// Nhận thêm prop parsePrice từ cha truyền xuống
const CartItem = ({ item, updateQuantity, removeItem, parsePrice }) => {

    // Tính giá trị số thực tế
    const rawPrice = parsePrice ? parsePrice(item.price) : item.price;

    return (
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group border-b border-gray-50 last:border-0">

            {/* 1. Hình ảnh & Tên */}
            <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Xóa sản phẩm"
                >
                    <Trash2 size={18} />
                </button>
                <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 border border-gray-100 shrink-0">
                    <img src={item.image || item.img} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-800 line-clamp-2 mb-1">
                        <Link to={`/product/${item.id}`} className="hover:text-[#004535] transition-colors">
                            {item.name}
                        </Link>
                    </h3>
                    {/* Hiển thị các tùy chọn màu sắc/bộ nhớ nếu có */}
                    {item.options && !Array.isArray(item.options) && (
                        <p className="text-xs text-gray-500">
                            {Object.entries(item.options).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                    {key}: {value}
                                </span>
                            ))}
                        </p>
                    )}
                </div>
            </div>

            {/* 2. Đơn giá (Hiển thị nguyên gốc) */}
            <div className="hidden md:block col-span-2 text-center text-sm font-medium text-gray-600">
                {formatCurrency(rawPrice)}
            </div>

            {/* 3. Bộ chỉnh số lượng */}
            <div className="col-span-6 md:col-span-2 flex justify-center">
                <div className="flex items-center border border-gray-300 rounded-lg h-9">
                    <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#004535] hover:bg-gray-50 rounded-l-lg transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="w-10 h-full text-center text-sm font-semibold text-gray-800 focus:outline-none border-x border-gray-300"
                    />
                    <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#004535] hover:bg-gray-50 rounded-r-lg transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* 4. Thành tiền (FIX LỖI Ở ĐÂY) */}
            <div className="col-span-6 md:col-span-2 text-right md:text-center">
                <span className="md:hidden text-sm text-gray-500 mr-2">Tổng:</span>
                <span className="font-bold text-[#004535]">
                    {formatCurrency(rawPrice * item.quantity)}
                </span>
            </div>
        </div>
    );
};

export default CartItem;
