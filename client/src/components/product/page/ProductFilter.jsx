import * as Slider from '@radix-ui/react-slider';
import React, { useState, useEffect } from 'react';
import { productService } from '../../../services/api';

const ProductFilter = ({
   selectedBrand, onBrandSelect,
   selectedCategory, onCategorySelect,
   tempPriceRange, setTempPriceRange,
   applyPriceFilter
}) => {

   const [brands, setBrands] = useState([]);
   const [categories, setCategories] = useState([]);

   useEffect(() => {
      const fetchBrands = async () => {
         try {
            const res = await productService.getBrands();
            setBrands(res.data.data || []);
         } catch (error) {
            console.error("Failed to fetch brands", error);
         }
      };

      const fetchCategories = async () => {
         try {
            const res = await productService.getParentCategories();
            setCategories(res.data.data || []);
         } catch (error) {
            console.error("Failed to fetch categories", error);
         }
      };

      fetchBrands();
      fetchCategories();
   }, []);

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

         {/* 0. LỌC DANH MỤC (Parent Categories) */}
         <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
               <h3 className="font-bold text-gray-800 text-sm">Danh mục</h3>
               {selectedCategory && (
                  <button onClick={() => onCategorySelect(null)} className="text-xs text-red-500 hover:underline">
                     Bỏ chọn
                  </button>
               )}
            </div>
            <div className="flex flex-col gap-1">
               {categories.map((cat) => {
                  const isActive = selectedCategory === cat.category_name;
                  return (
                     <button
                        key={cat.category_id}
                        onClick={() => onCategorySelect(isActive ? null : cat.category_name)}
                        className={`px-3 py-2 text-sm text-left rounded transition-all ${isActive
                           ? 'bg-[#004535] text-white font-medium'
                           : 'text-gray-600 hover:bg-gray-50 hover:text-[#004535]'
                           }`}
                     >
                        {cat.category_name}
                     </button>
                  );
               })}
            </div>
         </div>

         {/* 1. Lọc Hãng */}
         <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
               <h3 className="font-bold text-gray-800 text-sm">Lựa chọn hãng</h3>
               {/* Nút bỏ chọn hãng */}
               {selectedBrand && (
                  <button onClick={() => onBrandSelect(null)} className="text-xs text-red-500 hover:underline">
                     Bỏ chọn
                  </button>
               )}
            </div>
            <div className="grid grid-cols-2 gap-2">
               {brands.map((brand) => {
                  // Use slug for comparison if likely used in URL, fallback to lowercase name
                  const brandValue = brand.slug || brand.brand_name.toLowerCase();
                  const isActive = selectedBrand === brandValue;

                  return (
                     <button
                        key={brand.brand_id}
                        onClick={() => onBrandSelect(isActive ? null : brandValue)}
                        className={`border rounded px-2 py-2 text-xs font-medium transition-all ${isActive
                           ? 'border-[#004535] bg-[#004535] text-white'
                           : 'border-gray-200 text-gray-600 hover:border-[#004535] hover:text-[#004535] hover:bg-gray-50'
                           }`}
                     >
                        {brand.brand_name}
                     </button>
                  );
               })}
            </div>
         </div>

         {/* 2. Lọc Giá */}
         <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Mức giá</h3>

            {/* Slider Functional */}
            <div className="flex items-center px-1 mb-6 mt-2">
               <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={[tempPriceRange[0], Math.min(tempPriceRange[1], 50000000)]} // Cap visual max at 50M
                  max={50000000}
                  step={500000}
                  minStepsBetweenThumbs={1}
                  onValueChange={(val) => setTempPriceRange(val)}
               >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                     <Slider.Range className="absolute bg-[#004535] rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                     className="block w-4 h-4 bg-white border-2 border-[#004535] shadow-[0_2px_10px] shadow-black/10 rounded-[10px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004535]/20 transition-transform hover:scale-110"
                     aria-label="Minimum Price"
                  />
                  <Slider.Thumb
                     className="block w-4 h-4 bg-white border-2 border-[#004535] shadow-[0_2px_10px] shadow-black/10 rounded-[10px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#004535]/20 transition-transform hover:scale-110"
                     aria-label="Maximum Price"
                  />
               </Slider.Root>
            </div>

            {/* Input nhập giá thủ công */}
            <div className="flex items-center gap-2 mb-3">
               <input
                  type="text"
                  placeholder="Min"
                  value={tempPriceRange[0] === 0 ? '' : new Intl.NumberFormat('vi-VN').format(tempPriceRange[0])}
                  onChange={(e) => {
                     const val = Number(e.target.value.replace(/\D/g, ''));
                     setTempPriceRange([val, tempPriceRange[1]]);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-center focus:outline-none focus:border-[#004535]"
               />
               <span className="text-gray-400">-</span>
               <input
                  type="text"
                  placeholder="Max"
                  value={tempPriceRange[1] === 0 ? '' : new Intl.NumberFormat('vi-VN').format(tempPriceRange[1])}
                  onChange={(e) => {
                     const val = Number(e.target.value.replace(/\D/g, ''));
                     setTempPriceRange([tempPriceRange[0], val]);
                  }}
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