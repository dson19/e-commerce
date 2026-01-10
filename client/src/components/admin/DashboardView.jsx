import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Loader2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardView = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    revenueChart: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.data && res.data.success) {
          console.log("Dashboard Stats Data:", res.data.data);
          // Format revenue to number just in case
          const formattedData = {
            ...res.data.data,
            revenueChart: res.data.data.revenueChart?.map(item => ({
              ...item,
              revenue: Number(item.revenue)
            })) || []
          };
          setStats(formattedData);
        } else if (res.success && res.data) {
          setStats(res.data);
        }
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
    { label: 'Tổng doanh thu', value: `${stats.totalRevenue?.toLocaleString() || 0}₫`, color: 'bg-green-100 text-green-700' },
    { label: 'Doanh thu hôm nay', value: `${stats.todayRevenue?.toLocaleString() || 0}₫`, color: 'bg-blue-100 text-blue-700' },
    { label: 'Tổng đơn hàng', value: stats.totalOrders || 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'Khách hàng', value: stats.totalUsers || 0, color: 'bg-purple-100 text-purple-700' },
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

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-green-100 rounded-lg text-green-700">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Doanh thu 7 ngày gần nhất</h3>
        </div>

        <div className="w-full flex-1 min-h-[400px]">
          {stats.revenueChart && stats.revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="display_date" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()}₫`, 'Doanh thu']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#004535" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {loading ? 'Đang tải biểu đồ...' : 'Chưa có dữ liệu thống kê'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;