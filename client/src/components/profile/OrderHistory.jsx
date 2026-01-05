import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, AlertCircle, ShoppingBag, Clock, XCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService } from '@/services/api';
import { formatCurrency } from '@/utils/currency';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderService.getUserOrderHistory();
                if (res.data.success) {
                    setOrders(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusInfo = (status) => {
        const statusKey = status?.toUpperCase() || 'UNKNOWN';
        switch (statusKey) {
            case "PENDING":
                return {
                    label: "Chờ xác nhận",
                    color: "text-orange-500",
                    bg: "bg-orange-50",
                    icon: <Clock size={16} />,
                };
            case "SHIPPING":
                return {
                    label: "Đang vận chuyển",
                    color: "text-blue-500",
                    bg: "bg-blue-50",
                    icon: <Truck size={16} />,
                };
            case "DELIVERED":
            case "PAID":
                return {
                    label: "Giao thành công",
                    color: "text-green-600",
                    bg: "bg-green-50",
                    icon: <CheckCircle size={16} />,
                };
            case "CANCELLED":
                return {
                    label: "Đã hủy",
                    color: "text-red-500",
                    bg: "bg-red-50",
                    icon: <XCircle size={16} />,
                };
            default:
                return {
                    label: status,
                    color: "text-gray-500",
                    bg: "bg-gray-50",
                    icon: <Clock size={16} />,
                };
        }
    };

    const filteredOrders =
        activeTab === "ALL"
            ? orders
            : orders.filter((o) => o.status?.toUpperCase() === activeTab);

    const TABS = [
        { id: "ALL", label: "Tất cả" },
        { id: "PENDING", label: "Chờ xác nhận" },
        { id: "SHIPPING", label: "Đang giao" },
        { id: "DELIVERED", label: "Hoàn thành" },
        { id: "CANCELLED", label: "Đã hủy" },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-100 mb-4">
                <div className="flex overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-[#004535] text-[#004535]"
                                : "border-transparent text-gray-500 hover:text-[#004535]"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004535] mx-auto mb-4"></div>
                        <p className="text-gray-500">Đang tải đơn hàng...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <div
                                key={order.order_id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800 text-sm">
                                            #{order.order_id}
                                        </span>
                                        <span className="text-gray-400 text-xs">•</span>
                                        <span className="text-gray-500 text-xs">
                                            {formatDate(order.created_at)}
                                        </span>
                                    </div>
                                    <div
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold w-fit ${statusInfo.bg} ${statusInfo.color}`}
                                    >
                                        {statusInfo.icon}
                                        {statusInfo.label}
                                    </div>
                                </div>

                                <div className="p-4">
                                    {order.items?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 mb-4 last:mb-0"
                                        >
                                            <div className="w-20 h-20 border border-gray-100 rounded-lg shrink-0 p-1 flex items-center justify-center bg-gray-50 overflow-hidden">
                                                {item.img ? (
                                                    <img
                                                        src={item.img}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                    />
                                                ) : (
                                                    <Package size={24} className="text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                                                    {item.product_name}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">Màu: {item.color}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-gray-500 text-xs">
                                                        x{item.quantity}
                                                    </p>
                                                    <span className="text-[#004535] text-sm font-semibold sm:hidden">
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block text-right">
                                                <span className="text-[#004535] text-sm font-semibold">
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
                                    <div className="text-right sm:text-left w-full sm:w-auto">
                                        <span className="text-sm text-gray-500 mr-2">
                                            Thành tiền:
                                        </span>
                                        <span className="text-lg font-bold text-[#E11D48]">
                                            {formatCurrency(order.grand_total)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 w-full sm:w-auto">
                                        {order.status === "DELIVERED" || order.status === 'paid' ? (
                                            <>
                                                <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                                                    Đánh giá
                                                </button>
                                                <button className="flex-1 sm:flex-none px-4 py-2 bg-[#004535] text-white rounded-lg text-sm font-medium hover:bg-[#003528]">
                                                    Mua lại
                                                </button>
                                            </>
                                        ) : (
                                            <Link to={`/checkout/success/${order.order_id}`} className="flex-1 sm:flex-none px-6 py-2 border border-[#004535] text-[#004535] rounded-lg text-sm font-medium hover:bg-[#004535] hover:text-white transition-colors text-center">
                                                Xem chi tiết
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            Chưa có đơn hàng nào
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Bạn chưa có đơn hàng nào trong mục này.
                        </p>
                        <Link
                            to="/"
                            className="px-6 py-2.5 bg-[#004535] text-white rounded-full font-bold hover:bg-[#003528] transition-colors"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
