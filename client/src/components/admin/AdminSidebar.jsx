import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, PieChart, LogOut, ClipboardList } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuClass = (tabName) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tabName ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
    }`;

  return (
    <aside className="w-64 bg-[#004535] text-white flex flex-col fixed h-full shadow-2xl z-30">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wider">ADMIN STORE</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-white/40 uppercase mt-2 mb-2">Tổng quan</p>
        <button onClick={() => setActiveTab('dashboard')} className={menuClass('dashboard')}>
          <LayoutDashboard size={20} /> Dashboard
        </button>

        <p className="px-4 text-xs font-semibold text-white/40 uppercase mt-6 mb-2">Quản lý</p>
        <button onClick={() => setActiveTab('users')} className={menuClass('users')}>
          <Users size={20} /> Người dùng
        </button>
        <button onClick={() => setActiveTab('products')} className={menuClass('products')}>
          <ShoppingBag size={20} /> Sản phẩm
        </button>
        <button onClick={() => setActiveTab('orders')} className={menuClass('orders')}>
          <ClipboardList size={20} /> Đơn hàng
        </button>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={() => navigate('/')} className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-200 hover:bg-red-900/20 transition-colors">
          <LogOut size={20} /> Thoát Admin
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;