import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '@/context/AuthContext';
import {
  User, Package, Ticket, History, LayoutDashboard,
  MapPin, TicketPercent
} from 'lucide-react';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileOverview from '../components/profile/ProfileOverview';
import PersonalInfo from '../components/profile/PersonalInfo';
import AddressManagement from '../components/profile/AddressManagement';
import OrderHistory from '../components/profile/OrderHistory';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Đơn hàng của bạn', icon: <Package size={20} /> },
    { id: 'vouchers', label: 'Trung tâm voucher', icon: <TicketPercent size={20} /> },
    { id: 'history', label: 'Lịch sử mua hàng', icon: <History size={20} /> },
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={20} /> },
    { id: 'addresses', label: 'Sổ địa chỉ', icon: <MapPin size={20} /> },
  ];

  // --- HÀM RENDER NỘI DUNG ---
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview user={user} />;
      case 'profile':
        return <PersonalInfo user={user} updateUser={updateUser} />;
      case 'addresses':
        return <AddressManagement />;
      case 'orders':
        return <OrderHistory />;
      default:
        return <div className="text-center py-20 text-gray-400">Chức năng đang phát triển</div>;
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 mb-2">
        <Link to="/" className="hover:text-[#004535] transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Tài khoản của tôi</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start mt-4 mb-10">
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          menuItems={menuItems}
        />

        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;