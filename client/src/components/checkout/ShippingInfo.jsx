import React from 'react';
import { Truck, User, Phone, MapPin, ShoppingBag } from 'lucide-react';

const ShippingInfo = ({ order }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Đang cập nhật...';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Đang cập nhật...';
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Truck size={20} className="text-[#004535]" />
                    Thông tin nhận hàng
                </h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><User size={16} /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Người nhận</p>
                            <p className="text-sm font-bold text-gray-800">{order.shipping_name}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><Phone size={16} /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Số điện thoại</p>
                            <p className="text-sm font-medium text-gray-800">{order.shipping_phone}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><MapPin size={16} /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Địa chỉ giao hàng</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {order.street}, {order.ward}, {order.district}, {order.city}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Meta */}
            <div className="bg-[#004535] rounded-2xl p-6 text-white">
                <h3 className="font-bold flex items-center gap-2 mb-4 opacity-100">
                    <ShoppingBag size={20} />
                    Thông tin đơn hàng
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="opacity-70">Ngày đặt hàng</span>
                        <span className="font-medium">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="opacity-70">Hình thức thanh toán</span>
                        <span className="font-medium capitalize">{order.payment_method}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingInfo;
