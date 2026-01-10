import React, { useRef, useEffect } from 'react';
import { X, Package, MapPin } from 'lucide-react';

const OrderDetailModal = ({ order, onClose }) => {
    const modalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Don't render if no order
    if (!order) return null;

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div ref={modalRef} className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{order.order_id}</h3>
                        <p className="text-sm text-gray-500">Đặt ngày {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Status & Payment */}
                    <div className="flex flex-wrap gap-4 justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Trạng thái</p>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                {order.status}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phương thức thanh toán</p>
                            <p className="font-medium text-gray-800">{order.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng thanh toán</p>
                            <p className="font-bold text-[#004535] text-lg">{Number(order.grand_total).toLocaleString('vi-VN')}đ</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Customer Info */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Package size={18} className="text-[#004535]" />
                                Thông tin người nhận
                            </h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium text-gray-800">Tên:</span> {order.shipping_name || 'N/A'}</p>
                                <p><span className="font-medium text-gray-800">SĐT:</span> {order.shipping_phone || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-[#004535]" />
                                Địa chỉ giao hàng
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {order.street ? (
                                    <>
                                        {order.street}, {order.ward}<br />
                                        {order.district}, {order.city}
                                    </>
                                ) : 'Địa chỉ đã bị xóa hoặc không khả dụng'}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4">Sản phẩm ({order.items?.length || 0})</h4>
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                                    <tr>
                                        <th className="p-3 font-medium">Sản phẩm</th>
                                        <th className="p-3 font-medium text-center">SL</th>
                                        <th className="p-3 font-medium text-right">Đơn giá</th>
                                        <th className="p-3 font-medium text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {order.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0">
                                                        <img src={item.img} alt="" className="w-full h-full object-cover rounded" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 line-clamp-1">{item.product_name}</p>
                                                        <p className="text-xs text-gray-500">Màu: {item.color}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right text-gray-600">{Number(item.price).toLocaleString('vi-VN')}đ</td>
                                            <td className="p-3 text-right font-medium text-gray-800">
                                                {Number(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/50">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right text-gray-500">Tạm tính:</td>
                                        <td className="p-3 text-right font-medium">{Number(order.subtotal || order.grand_total).toLocaleString('vi-VN')}đ</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right font-bold text-gray-800">Tổng cộng:</td>
                                        <td className="p-3 text-right font-bold text-[#004535]">{Number(order.grand_total).toLocaleString('vi-VN')}đ</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
