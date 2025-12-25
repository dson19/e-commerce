import React, { useState, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import { PRODUCTS } from '../data/mockData';

// Import các component con
import ProductFilter from '../components/product_page/ProductFilter';
import SortBar from '../components/product_page/SortBar';
import ProductCard from '@/components/ProductCard';
import { SearchX } from 'lucide-react';

// Hàm chuyển đổi giá tiền từ chuỗi sang số
const parsePrice = (priceString) => {
   if (!priceString) return 0;
   if (typeof priceString === 'number') return priceString;
   return parseInt(priceString.replace(/[^\d]/g, ''), 10);
};

const ProductsPage = () => {
  // --- 1. STATES QUẢN LÝ LỌC ---
  const [selectedBrand, setSelectedBrand] = useState(null); // Hãng (null = tất cả)
  
  // Khoảng giá đang áp dụng lọc
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 1000000000]); 
  
  // Khoảng giá hiển thị trên ô input (chưa áp dụng cho đến khi bấm nút)
  const [tempPriceRange, setTempPriceRange] = useState([0, 50000000]);

  const [sortOption, setSortOption] = useState('default'); // default, newest, price_asc, price_desc

  // Hàm xử lý khi bấm nút "Áp dụng" giá
  const handleApplyPrice = (min, max) => {
     // Nếu truyền tham số trực tiếp (từ các nút chọn nhanh)
     if (min !== undefined && max !== undefined) {
        setAppliedPriceRange([min, max]);
     } else {
        // Nếu không truyền, lấy từ state input
        setAppliedPriceRange(tempPriceRange);
     }
  };

  // --- 2. LOGIC LỌC & SẮP XẾP (Dùng useMemo để tối ưu) ---
  const filteredProducts = useMemo(() => {
     let result = [...PRODUCTS];

     // A. Lọc theo Hãng
     if (selectedBrand) {
        // Giả sử trong mockData, category id là 'apple', 'samsung'...
        result = result.filter(p => p.category?.toLowerCase() === selectedBrand);
     }

     // B. Lọc theo Giá
     const [minPrice, maxPrice] = appliedPriceRange;
     result = result.filter(p => {
        const priceNumber = parsePrice(p.price);
        return priceNumber >= minPrice && priceNumber <= maxPrice;
     });

     // C. Sắp xếp
     switch (sortOption) {
        case 'price_asc': // Giá thấp -> cao
           result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
           break;
        case 'price_desc': // Giá cao -> thấp
           result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
           break;
        case 'newest': // Mới nhất (Giả sử ID lớn là mới)
           result.sort((a, b) => b.id - a.id);
           break;
        default: // Mặc định
           break;
     }

     return result;
  }, [selectedBrand, appliedPriceRange, sortOption]); // Chạy lại khi các state này đổi

  return (
    <MainLayout>
      <div className="bg-[#F4F6F8] min-h-screen py-4">
        <div className="container mx-auto px-4 max-w-[1200px]">
          
          <div className="text-xs text-gray-500 mb-4">
             Trang chủ / <span className="text-gray-800">Điện thoại</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* CỘT TRÁI: BỘ LỌC */}
            <aside className="hidden lg:block lg:col-span-3">
               <ProductFilter 
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  tempPriceRange={tempPriceRange}
                  setTempPriceRange={setTempPriceRange}
                  applyPriceFilter={handleApplyPrice}
               />
            </aside>

            {/* CỘT PHẢI: KẾT QUẢ */}
            <main className="lg:col-span-9">
               
               {/* Banner danh mục (Giữ nguyên) */}
               

               {/* Thanh sắp xếp */}
               <SortBar 
                  sortOption={sortOption}
                  setSortOption={setSortOption}
               />

               {/* Danh sách sản phẩm */}
               <div className="bg-white p-4 rounded-lg shadow-sm min-h-[500px]">
                  <h1 className="text-lg font-bold text-gray-800 mb-2">
                     {selectedBrand ? `Điện thoại ${selectedBrand.toUpperCase()}` : 'Tất cả điện thoại'}
                  </h1>
                  
                  {/* Hiển thị số lượng tìm thấy */}
                  <p className="text-xs text-gray-500 mb-6">
                     Tìm thấy <b>{filteredProducts.length}</b> sản phẩm phù hợp.
                  </p>

                  {filteredProducts.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredProducts.map(product => (
                           <ProductCard key={product.id} product={product} />
                        ))}
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-10">
                        <SearchX size={48} className="text-gray-300 mb-3"/>
                        <p className="text-gray-500">Không tìm thấy sản phẩm nào trong khoảng giá này.</p>
                        <button 
                           onClick={() => {
                              setSelectedBrand(null);
                              setAppliedPriceRange([0, 1000000000]);
                           }}
                           className="mt-4 px-4 py-2 bg-[#004535] text-white rounded text-sm hover:bg-[#003528]"
                        >
                           Xóa bộ lọc
                        </button>
                     </div>
                  )}
                  
                  {/* Pagination (Tạm ẩn nếu không có nhiều sp) */}
                  {filteredProducts.length > 0 && (
                     <div className="mt-8 text-center">
                        <button className="px-10 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 text-sm font-medium">
                           Xem thêm
                        </button>
                     </div>
                  )}
               </div>

            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;