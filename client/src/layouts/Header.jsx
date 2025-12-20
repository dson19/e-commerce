import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Settings, Package, LogOut, PlusCircle, LogIn } from 'lucide-react';

// 1. Import hook useAuth từ file Context của bạn
// (Hãy chắc chắn đường dẫn này đúng với nơi bạn lưu file AuthContext)
import { useAuth } from '../context/authContext'; 

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 2. Lấy user và hàm signOut từ Context
  const { user, signOut, loading } = useAuth(); 

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    setIsDropdownOpen(false); // Đóng menu
    await signOut(); // Gọi hàm signOut từ AuthContext (để gọi API xóa cookie)
    navigate('/signin'); // Chuyển về trang login
  };

  // Click outside để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm lấy chữ cái đầu của tên (Ví dụ: "Trung" -> "T")
  const getAvatarLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-[1200px] h-16 flex items-center justify-between gap-8">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[#004535] shrink-0">
          MobileStore
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#004535] text-sm"/>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18}/></button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link to="/cart" className="relative group">
            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-[#E5F2F0]"><ShoppingCart size={20} className="text-gray-700 group-hover:text-[#004535]"/></div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
          </Link>

          {/* --- LOGIC HIỂN THỊ USER ĐÃ SỬA --- */}
          {/* 2. Kiểm tra Loading trước */}
          {loading ? (
            // Hiệu ứng Loading (Skeleton) - Giữ chỗ để không bị nhảy layout
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> Hiện Avatar & Dropdown
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 focus:outline-none">
                <div className="w-9 h-9 rounded-full bg-[#1a5d1a] text-white flex items-center justify-center font-bold text-sm border-2 border-white ring-2 ring-gray-100 hover:ring-[#1a5d1a] transition-all">
                  {getAvatarLetter(user.full_name || user.username)} 
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Header Dropdown */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <div className="w-10 h-10 rounded-full bg-[#1a5d1a] text-white flex items-center justify-center font-bold text-lg">
                      {getAvatarLetter(user.full_name || user.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">
                        {user.full_name || user.username || "Người dùng"}
                      </h4>
                      <p className="text-gray-500 text-xs truncate">
                        {user.email || "Chưa cập nhật email"}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <Settings size={18} className="text-gray-500" /> Quản lý tài khoản
                    </Link>
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <Package size={18} className="text-gray-500" /> Đơn hàng của tôi
                    </Link>
                    
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP -> Hiện nút "Đăng nhập"
            <Link 
              to="/signin" 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#004535] text-white hover:bg-[#003528] transition-colors text-sm font-bold shadow-md"
            >
              <LogIn size={18} />
              <span>Đăng nhập</span>
            </Link>
          )}
          
        </div>
      </div>
    </header>
  );
};

export default Header;