import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Settings,
  Package,
  LogOut,
  LogIn,
} from "lucide-react";

// Import dữ liệu và context
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/authContext";
import { PRODUCTS } from "../data/mockData"; // <--- 1. Import PRODUCTS để lọc

const Header = () => {
  const navigate = useNavigate();
  
  // State tìm kiếm & Gợi ý
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]); // Lưu danh sách gợi ý
  const [showDropdown, setShowDropdown] = useState(false); // Ẩn/hiện dropdown
  const searchRef = useRef(null); // Ref để bắt sự kiện click ra ngoài

  // Auth & Cart
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cartItems } = useCart();
  const { user, signOut, loading } = useAuth();
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // --- LOGIC 1: LỌC SẢN PHẨM KHI NHẬP LIỆU ---
  useEffect(() => {
    if (keyword.trim().length > 0) {
      const lowerKeyword = keyword.toLowerCase();
      // Lọc sản phẩm theo tên
      const matches = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(lowerKeyword)
      ).slice(0, 5); // Chỉ lấy tối đa 5 kết quả
      
      setSuggestions(matches);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [keyword]);

  // --- LOGIC 2: CLICK RA NGOÀI ĐỂ ĐÓNG DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Xử lý đóng search dropdown
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      // Xử lý đóng user dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowDropdown(false); // Đóng gợi ý khi enter
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await signOut();
    navigate("/signIn");
  };

  const getAvatarLetter = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-[1200px] h-16 flex items-center justify-between gap-8">
        <Link to="/" className="text-2xl font-bold text-[#004535] shrink-0">
          MobileStore
        </Link>

        {/* --- KHU VỰC TÌM KIẾM (Đã sửa) --- */}
        <div ref={searchRef} className="flex-1 max-w-xl relative z-50">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-full py-3 pl-5 pr-12 outline-none focus:ring-1 focus:ring-[#004535] focus:bg-white transition-all"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => keyword.trim() && setShowDropdown(true)} // Hiện lại khi click vào
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#004535] text-white rounded-full flex items-center justify-center hover:bg-[#003528] transition-colors"
            >
              <Search size={16} />
            </button>
          </form>

          {/* --- DROPDOWN GỢI Ý  --- */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase">
                Sản phẩm gợi ý
              </div>
              <div className="divide-y divide-gray-50">
                {suggestions.map((product) => {
                    // Xử lý ảnh (vì mockData của bạn có url dài)
                    const imgUrl = product.img.split(';')[0];
                    return (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => setShowDropdown(false)} // Đóng khi click chọn
                            className="flex items-center gap-4 p-3 hover:bg-[#F2F4F7] transition-colors group"
                        >
                            <div className="w-12 h-12 shrink-0 bg-white rounded border border-gray-100 p-1">
                                <img 
                                    src={imgUrl} 
                                    alt={product.name} 
                                    className="w-full h-full object-contain mix-blend-multiply" 
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#004535]">
                                    {product.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sm font-bold text-red-600">
                                        {product.price}
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-xs text-gray-400 line-through">
                                            {product.oldPrice}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
              </div>
              {/* Nút xem tất cả nếu cần */}
              <div 
                onClick={handleSearch}
                className="p-3 text-center text-sm text-[#004535] font-medium hover:bg-gray-50 cursor-pointer border-t border-gray-100"
              >
                Xem tất cả kết quả cho "{keyword}"
              </div>
            </div>
          )}
        </div>
        {/* --- HẾT KHU VỰC TÌM KIẾM --- */}

        {/* Actions (Cart & User) - Giữ nguyên */}
        <div className="flex items-center gap-6">
          <Link to="/cart" className="relative group">
            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-[#E5F2F0]">
              <ShoppingCart size={20} className="text-gray-700 group-hover:text-[#004535]" />
            </div>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </Link>

          {loading ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 focus:outline-none">
                <div className="w-9 h-9 rounded-full bg-[#1a5d1a] cursor-pointer text-white flex items-center justify-center font-bold text-sm border-2 border-white ring-2 ring-gray-100 hover:ring-[#1a5d1a] transition-all">
                  {getAvatarLetter(user.fullname)}
                </div>
              </button>
              {isDropdownOpen && (
                 <div className="absolute right-0 top-full mt-3 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  {/* ... (Phần User Menu giữ nguyên như code cũ của bạn) ... */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <div className="w-10 h-10 rounded-full bg-[#1a5d1a] text-white flex items-center justify-center font-bold text-lg">
                      {getAvatarLetter(user.fullname)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{user.fullname}</h4>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"><Settings size={18} className="text-gray-500"/> Quản lý tài khoản</Link>
                    <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"><Package size={18} className="text-gray-500"/> Đơn hàng của tôi</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"><LogOut size={18}/> Đăng xuất</button>
                  </div>
                 </div>
              )}
            </div>
          ) : (
            <Link to="/signIn" className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full bg-[#004535] text-white hover:bg-[#003528] transition-colors text-sm font-bold shadow-md">
              <LogIn size={18} /> <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;