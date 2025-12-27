import React from 'react';
import { Search, Bell } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
      <div className="relative w-96 hidden md:block">
        <input type="text" placeholder="Tìm kiếm nhanh..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-[#004535] transition-all" />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-[#004535]">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">Admin User</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#004535] flex items-center justify-center text-white font-bold shadow-md border-2 border-white">A</div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;