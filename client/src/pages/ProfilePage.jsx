import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '@/context/AuthContext-temp';
import { authService } from '@/services/api';
import { toast } from 'sonner';
import {
  User, Package, Ticket, History, LayoutDashboard,
  Camera, TicketPercent
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone_number: '',
    address: '',
  });

  // Load dữ liệu user vào form khi trang vừa tải
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.updateProfile(formData);
      updateUser(res.data.data || formData);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Đơn hàng của bạn', icon: <Package size={20} /> },
    { id: 'vouchers', label: 'Trung tâm voucher', icon: <TicketPercent size={20} /> },
    { id: 'history', label: 'Lịch sử mua hàng', icon: <History size={20} /> },
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={20} /> },
  ];

  // --- HÀM RENDER NỘI DUNG (SỬA LỖI Ở ĐÂY) ---
  const renderContent = () => {
    // 1. Tab TỔNG QUAN
    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#004535] to-[#00654e] rounded-xl p-6 text-white flex justify-between items-center shadow-lg">
            <div>
              <p className="text-white/80 text-sm mb-1">Thành viên {user?.rank || 'Bạc'}</p>
              <h2 className="text-2xl font-bold">Xin chào, {user?.fullname}</h2>
              <p className="text-white/60 text-xs mt-2">Điểm tích lũy: {user?.points || 0} điểm</p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-2xl font-bold">{user?.fullname?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Demo stats */}
            <div className="bg-white border p-4 rounded-xl text-center"><span className="block text-2xl font-bold">2</span><span className="text-xs text-gray-500">Đơn hàng</span></div>
            <div className="bg-white border p-4 rounded-xl text-center"><span className="block text-2xl font-bold text-green-600">0</span><span className="text-xs text-gray-500">Voucher</span></div>
          </div>
        </div>
      );
    }

    // 2. Tab THÔNG TIN CÁ NHÂN (Form)
    if (activeTab === 'profile') {
      return (
        <form onSubmit={handleSubmit}>
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-10">
            {/* Form Fields */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text" name="fullname"
                  value={formData.fullname} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#004535] focus:ring-1 focus:ring-[#004535] outline-none"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" value={formData.email} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">*Email không thể thay đổi</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="text" name="phone_number"
                    value={formData.phone_number}
                    disabled
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">*Số điện thoại không thể thay đổi</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text" name="address"
                  value={formData.address} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#004535] outline-none"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading} className={`bg-[#004535] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#004535]/30 flex items-center gap-2 transition-all ${isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-[#003528]'}`}>
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="w-full md:w-[240px] flex flex-col items-center border-l border-gray-100 pl-0 md:pl-10">
              <div className="relative group cursor-pointer mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#004535] flex items-center justify-center text-white text-4xl font-bold">
                  {user?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-[#004535]">
                  <Camera size={18} />
                </div>
              </div>
              <button type="button" className="text-sm font-medium text-[#004535] hover:underline">Chọn ảnh</button>
            </div>
          </div>
        </form>
      );
    }

    return <div className="text-center py-20 text-gray-400">Chức năng đang phát triển</div>;
  };

  return (
    <MainLayout>
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 mb-2">
        <Link to="/" className="hover:text-[#004535] transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Tài khoản của tôi</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start mt-4 mb-10">
        <aside className="w-full md:w-[280px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#004535] flex items-center justify-center text-white font-bold text-lg">
              {user?.fullname?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Xin chào,</p>
              <h3 className="font-bold text-gray-800 truncate max-w-[150px]">{user?.fullname}</h3>
            </div>
          </div>
          <ul className="p-3 space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-[#E5F2F0] text-[#004535]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span className={activeTab === item.id ? 'text-[#004535]' : 'text-gray-400'}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;