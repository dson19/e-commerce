import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { Loader2, TrendingUp } from 'lucide-react';

const DashboardView = () => {
  const [stats, setStats] = useState({ revenue: 0, newOrders: 0, totalUsers: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);

  // Cấu hình API ngay tại đây
  const api = axios.create({
    baseURL: 'https://e-commerce-6gc6.onrender.com/api',
    withCredentials: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.warn("Chưa kết nối được API stats, dùng dữ liệu mẫu");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#004535]" /></div>;

  const cards = [
    { label: 'Tổng doanh thu', value: `${stats.revenue?.toLocaleString() || 0}₫`, color: 'bg-green-100 text-green-700' },
    { label: 'Đơn hàng mới', value: stats.newOrders || 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'Khách hàng', value: stats.totalUsers || 0, color: 'bg-purple-100 text-purple-700' },
    { label: 'Sản phẩm', value: stats.totalProducts || 0, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium">{item.label}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-2">{item.value}</h3>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col items-center justify-center text-gray-400">
        <TrendingUp size={48} className="mb-2 opacity-50"/>
        <p>Biểu đồ doanh thu sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
};

export default DashboardView;