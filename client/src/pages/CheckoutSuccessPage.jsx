import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Package, Truck, ShoppingBag, ArrowRight, MapPin, Phone, User } from 'lucide-react';
import { fetchOrderDetail, clearCurrentOrder } from '@/redux/orderSlice';

const CheckoutSuccessPage = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const { currentOrder: order, loading } = useSelector((state) => state.order);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderDetail(orderId));
        }
        return () => dispatch(clearCurrentOrder());
    }, [dispatch, orderId]);

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

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004535] mb-4"></div>
                <p className="text-gray-500 font-medium">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
                <p className="text-gray-500 mb-8 max-w-md">Chúng tôi không thể tìm thấy thông tin cho mã đơn hàng này. Vui lòng kiểm tra lại trong lịch sử đơn hàng.</p>
                <Link to="/orders" className="bg-[#004535] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#003528] transition-all">
                    Xem lịch sử đơn hàng
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
            {/* Success Header */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Đặt hàng thành công!</h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    Cảm ơn bạn đã tin tưởng mua sắm tại MobileStore. Đơn hàng <span className="font-bold text-[#004535]">#{orderId}</span> của bạn đã được tiếp nhận và đang được xử lý.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Box */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={20} className="text-[#004535]" />
                                Sản phẩm đã chọn
                            </h3>
                            <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-600 rounded-md border border-amber-100 uppercase tracking-tighter">
                                {order.status === 'Pending' ? 'Chờ xử lý' : order.status}
                            </span>
                        </div>
                        <div className="p-6 divide-y divide-gray-50">
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
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
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

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link to="/" className="flex-1 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                            Tiếp tục mua sắm
                        </Link>
                        <Link to="/profile/orders" className="flex-1 bg-[#004535] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#004535]/20 hover:bg-[#003528] transition-all">
                            Theo dõi đơn hàng <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Info Sidebar */}
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
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
