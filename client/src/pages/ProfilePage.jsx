import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { 
  User, 
  Package, 
  Ticket, 
  History, 
  LayoutDashboard, 
  Camera, 
  Save 
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Danh sách menu bên trái (Giống hệt ảnh 1)
  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={20} /> },
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Đơn hàng của bạn', icon: <Package size={20} /> },
    { id: 'vouchers', label: 'Trung tâm voucher', icon: <Ticket size={20} /> },
    { id: 'history', label: 'Lịch sử mua hàng', icon: <History size={20} /> },
    
  ];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6 items-start my-8">
        
        {/* --- 1. SIDEBAR (BÊN TRÁI - Style giống ảnh 1) --- */}
        <aside className="w-full md:w-[280px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
          
          {/* Header User nhỏ */}
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
               <img src="https://ui-avatars.com/api/?name=User&background=004535&color=fff" alt="Avatar" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Xin chào,</p>
              <h3 className="font-bold text-gray-800">Nguyễn Văn A</h3>
            </div>
          </div>

          {/* Menu Items */}
          <ul className="p-3 space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-[#E5F2F0] text-[#004535]' // Active: Nền xanh nhạt, chữ xanh đậm (Chuẩn ảnh mẫu)
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-[#004535]' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* --- 2. NỘI DUNG CHÍNH (BÊN PHẢI - Style giống ảnh 2) --- */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
          
          {/* Header Form */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>

          {/* Form Content */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col-reverse md:flex-row gap-10">
              
              {/* Cột Trái: Các trường nhập liệu */}
              <div className="flex-1 space-y-6">
                
                {/* Họ & Tên (2 cột) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ (Last Name)</label>
                    <input 
                      type="text" 
                      defaultValue="Nguyễn"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#004535] focus:ring-1 focus:ring-[#004535] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tên (First Name)</label>
                    <input 
                      type="text" 
                      defaultValue="Văn A"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#004535] focus:ring-1 focus:ring-[#004535] transition-all" 
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" defaultValue="email@example.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004535] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                    <input type="text" defaultValue="0987654321" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004535] outline-none transition-all" />
                  </div>
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                  <input 
                    type="text" 
                    defaultValue="89 Láng Hạ, Đống Đa, Hà Nội"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004535] outline-none transition-all" 
                  />
                </div>

                {/* Khu vực đổi mật khẩu (Password Changes) */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">Đổi mật khẩu</h3>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="Mật khẩu hiện tại"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004535] outline-none transition-all" 
                    />
                    <input 
                      type="password" 
                      placeholder="Mật khẩu mới"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004535] outline-none transition-all" 
                    />
                    <input 
                      type="password" 
                      placeholder="Xác nhận mật khẩu mới"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#004535] outline-none transition-all" 
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                    Hủy bỏ
                  </button>
                  <button className="bg-[#004535] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#003528] transition-colors shadow-lg shadow-[#004535]/30">
                    Lưu thay đổi
                  </button>
                </div>
              </div>

              {/* Cột Phải: Avatar (Cho cân đối layout) */}
              <div className="w-full md:w-[240px] flex flex-col items-center border-l border-gray-100 pl-0 md:pl-10">
                <div className="relative group cursor-pointer mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="https://ui-avatars.com/api/?name=User&background=004535&color=fff&size=200" 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay icon máy ảnh */}
                  <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-[#004535]">
                     <Camera size={18} />
                  </div>
                </div>
                <button className="text-sm font-medium text-[#004535] hover:underline">
                  Chọn ảnh đại diện
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center px-4">
                  Dụng lượng file tối đa 1 MB. Định dạng: .JPEG, .PNG
                </p>
              </div>

            </div>
          </form>
        </div>

      </div>
    </MainLayout>
  );
};

export default ProfilePage;