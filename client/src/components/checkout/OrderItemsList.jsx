import React from 'react';
import { Package } from 'lucide-react';

const OrderItemsList = ({ order, isPendingPayment }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Package size={20} className="text-[#004535]" />
                    {isPendingPayment ? 'Chi tiết đơn hàng' : 'Sản phẩm đã chọn'}
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-md border uppercase tracking-tighter ${isPendingPayment ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                    {isPendingPayment ? 'Chờ thanh toán' : order.status}
                </span>
            </div>
            <div className="p-6 divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                {order.items?.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.img ? (
                                <img src={item.img} alt={item.product_name} className="w-full h-full object-contain" />
                            ) : (
                                <Package size={24} className="text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm truncate">{item.product_name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Màu: <span className="text-gray-700">{item.color}</span> | SL: <span className="text-gray-700">{item.quantity}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[#004535] text-sm">
                                {Number(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {/* Summary Footer */}
            <div className="bg-gray-50/50 p-6 space-y-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính</span>
                    <span className="font-medium text-gray-800">{Number(order.grand_total).toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng thanh toán</span>
                    <span className="text-2xl font-black text-[#004535]">{Number(order.grand_total).toLocaleString('vi-VN')}₫</span>
                </div>
            </div>
        </div>
    );
};

export default OrderItemsList;
