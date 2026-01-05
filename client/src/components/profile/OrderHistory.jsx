import React, { useEffect, useState } from 'react';
import { Package, Eye, ChevronRight, Clock, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderHistory } from '@/redux/orderSlice';
import OrderDetailModal from './OrderDetailModal';

const OrderHistory = () => {
    const dispatch = useDispatch();
    const { history: orders, loading } = useSelector((state) => state.order);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        dispatch(fetchOrderHistory());
    }, [dispatch]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return <CheckCircle size={16} className="text-green-500" />;
            case 'pending': return <Clock size={16} className="text-amber-500" />;
            default: return <AlertCircle size={16} className="text-blue-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'Đã thanh toán';
            case 'pending': return 'Chờ xử lý';
            case 'cancelled': return 'Đã hủy';
            default: return 'Đang xử lý';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Đơn hàng của bạn</h1>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi và quản lý các đơn hàng đã đặt</p>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004535] mx-auto"></div>
                        <p className="text-gray-500 mt-4 text-sm">Đang tải lịch sử đơn hàng...</p>
                    </div>
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                        <div
                            key={order.order_id}
                            onClick={() => setSelectedOrderId(order.order_id)}
                            className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 hover:border-[#004535]/30 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#E5F2F0] rounded-lg flex items-center justify-center text-[#004535]">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800 text-sm uppercase">#{order.order_id}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {getStatusIcon(order.status)}
                                            <span className="text-xs font-medium text-gray-600">
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tổng cộng</p>
                                        <p className="font-bold text-[#004535] text-lg leading-none">
                                            {Number(order.grand_total).toLocaleString('vi-VN')}₫
                                        </p>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-full text-gray-300 group-hover:text-[#004535] group-hover:bg-[#E5F2F0] transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                        <p className="text-xs text-gray-400 mt-1">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi</p>
                    </div>
                )}
            </div>

            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
        </div>
    );
};

export default OrderHistory;
