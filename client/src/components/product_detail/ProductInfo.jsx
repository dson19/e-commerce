import React, { useState } from 'react'; // 1. Import useState
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, ShoppingBag, CreditCard, Minus, Plus } from 'lucide-react'; // 2. Import icon Minus, Plus

const ProductInfo = ({ 
  product, 
  selectedOptions, 
  handleOptionSelect, 
  handleAddToCart 
}) => {
  
  // 3. State quản lý số lượng (Mặc định là 1)
  const [quantity, setQuantity] = useState(1);

  // Hàm render sao (Helper nội bộ)
  const renderRating = (r) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < r ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
    ));
  };

  // Hàm xử lý thay đổi số lượng
  const decreaseQty = () => setQuantity(prev => Math.max(1, prev - 1));
  const increaseQty = () => setQuantity(prev => prev + 1);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
      
      <div className="flex items-center space-x-2 mb-6 border-b pb-4 border-gray-100">
        <div className="flex">{renderRating(product.rating)}</div>
        <span className="text-sm text-gray-600">({product.reviewsCount} Đánh giá)</span>
      </div>

      {/* Giá */}
      <div className="mb-8">
        <span className="text-5xl font-extrabold text-red-600 block">{product.price}</span>
        <span className="text-xl text-gray-400 line-through mr-3">{product.oldPrice}</span>
        <span className="text-lg font-semibold text-green-600">({product.discount})</span>
      </div>

      {/* Tùy chọn (Màu sắc, Dung lượng...) */}
      {product.options.map(option => (
        <div key={option.name} className="mb-6">
          <p className="font-semibold mb-2">{option.name}: <span className="text-primary font-bold">{selectedOptions[option.name] || 'Chưa chọn'}</span></p>
          <div className="flex flex-wrap gap-2">
            {option.variants.map(variant => (
              <button
                key={variant}
                onClick={() => handleOptionSelect(option.name, variant)}
                className={`px-4 py-2 border rounded-full text-sm transition-all ${
                  selectedOptions[option.name] === variant
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* --- KHU VỰC CHỌN SỐ LƯỢNG & NÚT MUA --- */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 4. Bộ chọn số lượng */}
          <div className="w-32 h-14 border border-gray-300 rounded-lg flex items-center justify-between px-3 shrink-0">
             <button 
                onClick={decreaseQty}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#004535] hover:bg-gray-100 rounded transition-colors"
             >
                <Minus size={16} />
             </button>
             <span className="font-bold text-gray-800 text-lg">{quantity}</span>
             <button 
                onClick={increaseQty}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#004535] hover:bg-gray-100 rounded transition-colors"
             >
                <Plus size={16} />
             </button>
          </div>

          {/* 5. Nút CTA (Gọi hàm handleAddToCart kèm số lượng) */}
          <Button 
            onClick={() => handleAddToCart(quantity)} 
            className="flex-1 h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-colors shadow-lg"
          >
            <ShoppingBag className="w-5 h-5 mr-3" />
            THÊM VÀO GIỎ HÀNG
          </Button>
        </div>
      </div>
      
      {/* Trust Factors */}
      <div className="space-y-3 pt-8 mt-4">
        <TrustBadge icon={<Truck className="w-5 h-5 text-green-500" />} text="Miễn phí vận chuyển cho đơn hàng trên 5 triệu VNĐ" />
        <TrustBadge icon={<Shield className="w-5 h-5 text-green-500" />} text="Bảo hành chính hãng 12 tháng" />
        <TrustBadge icon={<CreditCard className="w-5 h-5 text-green-500" />} text="Thanh toán an toàn qua VNPAY, Momo, Visa/Mastercard" />
      </div>
    </div>
  );
};

// Component con nhỏ để hiển thị Trust Factor cho gọn
const TrustBadge = ({ icon, text }) => (
  <div className="flex items-center space-x-3 text-gray-700">
    {icon}
    <span>{text}</span>
  </div>
);

export default ProductInfo;