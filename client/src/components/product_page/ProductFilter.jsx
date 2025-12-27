import React, { useState } from 'react';

const ProductFilter = ({ 
  selectedBrand, setSelectedBrand, 
  tempPriceRange, setTempPriceRange, 
  applyPriceFilter 
}) => {
  
  const BRANDS = [
     "Apple", "Samsung", "Xiaomi", "OPPO", "Nokia", "Realme", "Vivo"
  ];

  // Cấu hình các khoảng giá mẫu
  const PRICE_OPTIONS = [
     { label: "Dưới 2 triệu", min: 0, max: 2000000 },
     { label: "2 - 4 triệu", min: 2000000, max: 4000000 },
     { label: "4 - 7 triệu", min: 4000000, max: 7000000 },
     { label: "7 - 13 triệu", min: 7000000, max: 13000000 },
     { label: "Trên 13 triệu", min: 13000000, max: 1000000000 }
  ];

  return (
    <div className="space-y-4">
       {/* 1. Lọc Hãng */}
       <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-gray-800 text-sm">Lựa chọn hãng</h3>
             {/* Nút bỏ chọn hãng */}
             {selectedBrand && (
                <button onClick={() => setSelectedBrand(null)} className="text-xs text-red-500 hover:underline">
                   Bỏ chọn
                </button>
             )}
          </div>
          <div className="grid grid-cols-2 gap-2">
             {BRANDS.map((brand, idx) => {
                const isActive = selectedBrand === brand.toLowerCase(); // So sánh không phân biệt hoa thường
                return (
                  <button 
                     key={idx} 
                     onClick={() => setSelectedBrand(isActive ? null : brand.toLowerCase())}
                     className={`border rounded px-2 py-2 text-xs font-medium transition-all ${
                        isActive 
                        ? 'border-[#004535] bg-[#004535] text-white' 
                        : 'border-gray-200 text-gray-600 hover:border-[#004535] hover:text-[#004535] hover:bg-gray-50'
                     }`}
                  >
                     {brand}
                  </button>
                );
             })}
          </div>
       </div>

       {/* 2. Lọc Giá */}
       <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Mức giá</h3>
          
          {/* Slider trang trí */}
          <div className="relative h-1 bg-gray-200 rounded mb-6 mt-2 mx-1">
             <div className="absolute left-0 w-full h-full bg-[#004535] rounded opacity-20"></div>
          </div>

          {/* Input nhập giá thủ công */}
          <div className="flex items-center gap-2 mb-3">
             <input 
                type="number" 
                placeholder="Min"
                value={tempPriceRange[0]}
                onChange={(e) => setTempPriceRange([Number(e.target.value), tempPriceRange[1]])}
                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-center focus:outline-none focus:border-[#004535]" 
             />
             <span className="text-gray-400">-</span>
             <input 
                type="number" 
                placeholder="Max"
                value={tempPriceRange[1]}
                onChange={(e) => setTempPriceRange([tempPriceRange[0], Number(e.target.value)])}
                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-center focus:outline-none focus:border-[#004535]" 
             />
          </div>
          
          <button 
             onClick={applyPriceFilter}
             className="w-full bg-[#004535] text-white text-xs font-bold py-2 rounded mb-4 hover:bg-[#003528] transition-colors"
          >
             ÁP DỤNG GIÁ
          </button>

          {/* Các khoảng giá có sẵn */}
          <div className="space-y-1">
             {PRICE_OPTIONS.map((range, idx) => (
                <div 
                   key={idx} 
                   onClick={() => {
                      setTempPriceRange([range.min, range.max]); // Cập nhật input hiển thị
                      applyPriceFilter(range.min, range.max); // Áp dụng lọc ngay
                   }}
                   className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs text-gray-600 hover:bg-[#E5F2F0] hover:text-[#004535] hover:border-[#004535] cursor-pointer text-center transition-all"
                >
                   {range.label}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default ProductFilter;