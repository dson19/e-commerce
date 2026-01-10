import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { Eye, Loader2, ChevronLeft, ChevronRight, Package, CheckCircle, XCircle, Truck, Clock, ArrowUpDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import OrderDetailModal from './OrderDetailModal';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    // Status update state
    const [updatingId, setUpdatingId] = useState(null);

    // Filter, Sort and Search state
    const [statusFilter, setStatusFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchOrders = useCallback(async (page, status, sort, search) => {
        try {
            setLoading(true);
            const params = { page, limit, sortBy: sort.key, sortOrder: sort.direction };
            if (status) params.status = status;
            if (search) params.search = search;

            const res = await adminService.getOrders(params);
            if (res.data.success) {
                setOrders(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
                setTotalItems(res.data.pagination.total);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Lỗi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const handleViewOrder = async (orderId) => {
        try {
            setLoadingDetails(true);
            const res = await adminService.getOrderDetails(orderId);
            if (res.data.success) {
                setSelectedOrder(res.data.data);
            }
        } catch (error) {
            console.error("Error loading order details:", error);
            toast.error("Lỗi tải chi tiết đơn hàng");
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(currentPage, statusFilter, sortConfig, searchTerm);
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [currentPage, statusFilter, sortConfig, searchTerm, fetchOrders]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            const res = await adminService.updateOrderStatus(orderId, newStatus);
            if (res.data.success) {
                toast.success(`Đã cập nhật đơn hàng #${orderId} sang trạng thái ${newStatus}`);
                // Refresh orders locally to reflect change immediately if needed, 
                // effectively map over orders and update the status
                setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Cập nhật trạng thái thất bại");
        } finally {
            setUpdatingId(null);
        }
    };

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

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock size={14} />;
            case 'processing': return <Package size={14} />;
            case 'shipped': return <Truck size={14} />;
            case 'delivered': return <CheckCircle size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return null;
        }
    };

    if (loading && orders.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#004535]" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm đơn hàng, khách hàng..."
                            className="text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#004535] w-full sm:w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset page on search
                            }}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    <select
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#004535] w-full sm:w-auto"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Pending">Chờ xác nhận (Pending)</option>
                        <option value="Processing">Đang xử lý (Processing)</option>
                        <option value="Shipped">Đang giao (Shipped)</option>
                        <option value="Delivered">Hoàn thành (Delivered)</option>
                        <option value="Cancelled">Đã hủy (Cancelled)</option>
                    </select>
                    <span className="text-sm text-gray-500 whitespace-nowrap">Tổng: <strong>{totalItems}</strong> đơn</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="p-4">Mã đơn hàng</th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Khách hàng
                                        <ArrowUpDown size={14} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date')}>
                                    <div className="flex items-center gap-2">
                                        Ngày đặt
                                        <ArrowUpDown size={14} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('total')}>
                                    <div className="flex items-center gap-2">
                                        Tổng tiền
                                        <ArrowUpDown size={14} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length > 0 ? orders.map(order => (
                                <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">
                                        #{order.order_id}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.fullname || 'Khách vãng lai'}</span>
                                            <span className="text-xs text-gray-400">{order.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                        <div className="text-xs text-gray-400">
                                            {new Date(order.order_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-[#004535]">
                                        {Number(order.grand_total).toLocaleString('vi-VN')}đ
                                    </td>
                                    <td className="p-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                className="text-xs border border-gray-200 rounded-lg p-1.5 outline-none focus:border-[#004535]"
                                                value={order.status}
                                                disabled={updatingId === order.order_id}
                                                onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                            {/* More detailed view can be added later */}
                                            <button
                                                onClick={() => handleViewOrder(order.order_id)}
                                                className="p-2 text-gray-400 hover:text-[#004535] hover:bg-green-50 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                {loadingDetails && selectedOrder?.order_id === order.order_id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400">Không có đơn hàng nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Trang {currentPage} trên {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#004535] text-white shadow-md' : 'hover:bg-gray-200'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
    );
};

export default OrderManagement;
