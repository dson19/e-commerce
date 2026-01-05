import React, { useEffect } from 'react';
import { X, Package, Truck, CreditCard, User, Phone, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetail, clearCurrentOrder } from '@/redux/orderSlice';

const OrderDetailModal = ({ orderId, onClose }) => {
    const dispatch = useDispatch();
    const { currentOrder, loading } = useSelector((state) => state.order);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderDetail(orderId));
        }
        return () => dispatch(clearCurrentOrder());
    }, [dispatch, orderId]);

    if (!orderId) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'text-green-600 bg-green-50 border-green-100';
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-blue-600 bg-blue-50 border-blue-100';
        }
    };

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'Đã thanh toán';
            case 'pending': return 'Đang xử lý';
            case 'cancelled': return 'Đã hủy';
            case 'shipped': return 'Đang giao hàng';
            default: return status;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
                <div className="p-6 border-b flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package size={22} className="text-[#004535]" />
                            Chi tiết đơn hàng #{orderId}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {currentOrder && formatDate(currentOrder.created_at)}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004535] mx-auto"></div>
                            <p className="text-gray-500 mt-4">Đang tải chi tiết đơn hàng...</p>
                        </div>
                    ) : currentOrder ? (
                        <>
                            {/* Order Status & Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Truck size={18} /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trạng thái</p>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${getStatusColor(currentOrder.status)}`}>
                                                {translateStatus(currentOrder.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><CreditCard size={18} /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Thanh toán</p>
                                            <p className="text-sm font-medium text-gray-700 capitalize mt-0.5">{currentOrder.payment_method}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><User size={18} /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Người nhận</p>
                                            <p className="text-sm font-bold text-gray-800 mt-0.5">{currentOrder.shipping_name}</p>
                                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 font-medium">
                                                <Phone size={14} className="text-gray-400" /> {currentOrder.shipping_phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">Sản phẩm đã mua</h3>
                                <div className="space-y-4">
                                    {currentOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg border flex items-center justify-center text-gray-300 font-bold overflow-hidden shrink-0">
                                                {/* You can add item images here if available in the model */}
                                                <Package size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.product_name}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Màu: {item.color} | SL: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[#004535] text-sm">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    {Number(item.price).toLocaleString('vi-VN')}đ / cái
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Total Information */}
                            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tạm tính:</span>
                                    <span className="font-medium text-gray-800">{Number(currentOrder.grand_total).toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Phí vận chuyển:</span>
                                    <span className="font-medium text-green-600">Miễn phí</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Tổng cộng:</span>
                                    <span className="text-xl font-black text-[#004535]">{Number(currentOrder.grand_total).toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center text-gray-400">Không tìm thấy thông tin đơn hàng</div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50/50 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full bg-[#004535] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#004535]/20 hover:bg-[#003528] transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
