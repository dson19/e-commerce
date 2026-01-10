import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, X } from 'lucide-react';
import { adminService } from '../../services/api';
import { Link } from 'react-router-dom';

const AdminHeader = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Get 5 most recent orders
        const res = await adminService.getOrders({ page: 1, limit: 5, sortBy: 'date', sortOrder: 'desc' });
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Optional: Poll for new notifications every few minutes
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm flex items-center justify-end px-8">
      <div className="flex items-center gap-6">

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="relative text-gray-500 hover:text-[#004535] transition-colors p-1"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 text-sm">Đơn hàng mới nhất</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-xs text-gray-500">Đang tải...</div>
                ) : notifications.length > 0 ? (
                  notifications.map((order) => (
                    <div key={order.order_id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className="mt-1 p-2 bg-green-50 text-[#004535] rounded-full h-fit">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-[#004535]">Đơn hàng #{order.order_id}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {order.fullname || 'Khách vãng lai'} - {Number(order.grand_total).toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(order.order_date).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">Chưa có thông báo nào</div>
                )}
              </div>
              <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                <button className="text-xs font-bold text-[#004535] hover:underline" onClick={() => setShowNotifications(false)}>
                  Xem tất cả đơn hàng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">Admin User</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#004535] flex items-center justify-center text-white font-bold shadow-md border-2 border-white ring-2 ring-gray-100">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;