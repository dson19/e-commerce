import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductSlider = ({ title, products }) => {
  const scrollRef = useRef(null);

  // Hàm xử lý lướt
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300; // Khoảng cách mỗi lần bấm nút (px)
      
      if (direction === 'left') {
        current.scrollLeft -= scrollAmount;
      } else {
        current.scrollLeft += scrollAmount;
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      {/* Tiêu đề Section */}
      <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-xl font-bold uppercase text-gray-800 border-l-4 border-[#004535] pl-3 leading-none">
          {title}
        </h2>
        <a href="#" className="text-sm text-[#004535] hover:underline font-medium">Xem tất cả</a>
      </div>

      {/* Khu vực Slider */}
      <div className="relative group">
        
        {/* Nút lùi (Trái) */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md p-2 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 -ml-4 hidden md:block"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Danh sách sản phẩm (Container cuộn) */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
        >
          {products.map((product) => (
            // Đặt min-width để đảm bảo thẻ không bị co lại
            <div key={product.id} className="min-w-[180px] md:min-w-[220px]"> 
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Nút tiến (Phải) */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md p-2 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 -mr-4 hidden md:block"
        >
          <ChevronRight size={24} />
        </button>

      </div>
    </div>
  );
};

export default ProductSlider;