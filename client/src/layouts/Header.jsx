import React, { use } from 'react';
import { Search, ShoppingBag, User } from 'lucide-react'; 
import { Link } from "react-router-dom";
import { useAuth } from '../context/authContext';

const Header = () => {
  const { user } = useAuth();
  const username = user ? user.username : null; 
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-t-4 border-primary">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex items-center justify-between py-3 gap-4">
          
          {/* 1. Logo */}
          <a href="/" className="flex items-center gap-2 font-bold text-2xl uppercase tracking-tighter text-primary shrink-0 hover:opacity-90">
            <div className="bg-primary text-white p-1 rounded text-lg h-8 w-8 flex items-center justify-center">H</div>
            <span className="hidden md:block">Mobile Store</span>
          </a>

          {/* 2. Search Bar (Thanh tìm kiếm) */}
          <div className="flex-1 max-w-[600px] relative">
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white hover:border-primary transition-colors group">
              <input 
                type="text" 
                placeholder="Hôm nay bạn muốn tìm gì?" 
                className="w-full py-2 px-4 text-sm outline-none text-gray-700 placeholder-gray-400" 
              />
              <button className="bg-white text-primary px-5 py-2 flex items-center gap-1 font-medium text-sm transition-colors group-hover:bg-gray-50">
                <Search size={18} /> 
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </div>
          </div>

          {/* 3. Actions (Nút bên phải) */}
          <div className="flex items-center gap-4 text-sm font-medium text-primary">
            
            {/* Nút Tài khoản - Đã chỉnh lại size icon = 20 và p-2 cho cân với giỏ hàng */}
            <Link to="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="border border-primary rounded-full p-2"> 
                <User size={20} /> 
              </div>
              <span className="hidden sm:block">{username || "Tài Khoản"}</span>
            </Link>

            {/* Nút Giỏ hàng */}
            <a href="#" className="bg-orange-100 p-2 rounded-full text-primary hover:opacity-80 relative transition-opacity">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                0
              </span>
            </a>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;