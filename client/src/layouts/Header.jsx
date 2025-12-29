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
  LayoutDashboard
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "../utils/currency";
import { productService } from "../services/api";

const Header = () => {
  const navigate = useNavigate();

  // State tìm kiếm & Gợi ý
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestedBrands, setSuggestedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Auth & Cart
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cartItems } = useCart();
  const { user, logout, loading } = useAuth();
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Fetch Brands on Mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await productService.getBrands();
        setBrands(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch brands in Header", error);
      }
    };
    fetchBrands();
  }, []);

  // --- LOGIC 1: LỌC SẢN PHẨM & BRANDS KHI NHẬP LIỆU ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = keyword.trim().toLowerCase();
      if (trimmed.length > 0) {
        // 1. Filter Brands
        const matchedBrands = brands.filter(b =>
          b.brand_name.toLowerCase().includes(trimmed)
        ).slice(0, 3);
        setSuggestedBrands(matchedBrands);

        try {
          // 2. Filter Products (API)
          const res = await productService.getProducts({ search: keyword, limit: 5 });
          const matches = res.data.data || [];

          const mapped = Array.isArray(matches) ? matches.map(p => ({
            ...p,
            price: p.min_price || "0"
          })) : [];

          setSuggestions(mapped);
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching suggestions", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setSuggestedBrands([]);
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [keyword, brands]);

  // --- LOGIC 2: CLICK RA NGOÀI ĐỂ ĐÓNG DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (keyword.trim()) {
      navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
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

          {/* --- DROPDOWN GỢI Ý (ENHANCED) --- */}
          {showDropdown && (suggestedBrands.length > 0 || suggestions.length > 0) && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

              {/* SECTION 1: CÓ PHẢI BẠN ĐANG CẦN TÌM (Brands) */}
              {suggestedBrands.length > 0 && (
                <div className="pb-2">
                  <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase">
                    Có phải bạn đang cần tìm
                  </div>
                  <div className="p-2 space-y-1">
                    {suggestedBrands.map(brand => (
                      <Link
                        key={brand.brand_id}
                        to={`/products?brand=${brand.slug || brand.brand_name}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-800 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <span>Chuyên trang {brand.brand_name}</span>
                        <span className="ml-auto opacity-70">Go &rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: SẢN PHẨM GỢI Ý */}
              {suggestions.length > 0 && (
                <>
                  <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase">
                    Sản phẩm gợi ý
                  </div>
                  <div className="divide-y divide-gray-50">
                    {suggestions.map((product) => {
                      const imgUrl = product.img ? product.img.split(';')[0] : '';
                      return (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-4 p-3 hover:bg-[#F2F4F7] transition-colors group"
                        >
                          <div className="w-10 h-10 shrink-0 bg-white rounded border border-gray-100 p-1">
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
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-red-600">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Nút xem tất cả */}
              <div
                onClick={handleSearch}
                className="p-3 text-center text-sm text-[#004535] font-medium hover:bg-gray-50 cursor-pointer border-t border-gray-100"
              >
                Xem tất cả kết quả cho <span className="font-bold">"{keyword}"</span>
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
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#004535] font-bold hover:bg-[#004535]/5 rounded-lg transition-colors border-b border-gray-100 mb-1"
                      >
                        <LayoutDashboard size={18} /> Trang quản trị
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"><Settings size={18} className="text-gray-500" /> Quản lý tài khoản</Link>
                    <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"><Package size={18} className="text-gray-500" /> Đơn hàng của tôi</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"><LogOut size={18} /> Đăng xuất</button>
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