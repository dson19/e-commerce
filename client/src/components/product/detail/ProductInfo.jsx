import React, { useState } from 'react';
import { Star, CheckCircle, Minus, Plus, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const ProductInfo = ({ product, selectedOptions, handleOptionSelect, handleAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  // Logic to determine price and stock to display
  let displayPrice = product.price;
  let displayOldPrice = product.oldPrice;
  let availableStock = 0;
  let activeVariant = null;

  // Handle selection based on mapped options
  if (product.options && product.variants) {
    // Find variant that matches ALL selected options
    activeVariant = product.variants.find(v => {
      return product.options.every(opt => {
        const selectedVal = selectedOptions[opt.name];
        if (!selectedVal) return true; // Ignore if option not selected? Or false? 
        // Better to only match if selected. If not selected, we can't be sure, but usually we auto-select.

        const key = opt.key || 'color';
        // Check loose equality for numbers/strings safety
        return v[key] == selectedVal;
      });
    });

    if (activeVariant) {
      // Use bestPrice/lastPrice from API (camelCase)
      displayPrice = activeVariant.bestPrice || activeVariant.price || displayPrice;
      displayOldPrice = activeVariant.old_price || activeVariant.lastPrice || displayOldPrice;
      availableStock = (activeVariant.stock || 0) - (activeVariant.reservedStock || 0);
    }
  }

  const isOutOfStock = availableStock <= 0;

  const handleQuantityChange = (type) => {
    if (type === 'decrease' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'increase' && quantity < availableStock) setQuantity(quantity + 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
        {product.name}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" className={i < Math.floor(product.rating) ? "" : "text-gray-200"} />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">({product.reviewsCount} đánh giá)</span>
        </div>
        <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
        {isOutOfStock ? (
          <span className="text-sm text-red-600 font-medium flex items-center gap-1">
            <CheckCircle size={14} className="text-red-400" /> Hết hàng
          </span>
        ) : (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
            <CheckCircle size={14} /> Còn hàng ({availableStock})
          </span>
        )}
        <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
        <span className="text-sm text-gray-500">SKU: {product.sku || `SP-${product.id}`}</span>
      </div>

      {/* Giá tiền */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[#004535]">{formatCurrency(displayPrice)}</span>
          {displayOldPrice && (
            <span className="text-lg text-gray-400 line-through mb-1">
              {formatCurrency(displayOldPrice)}
            </span>
          )}
          {product.discount && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-2">
              {product.discount}
            </span>
          )}
        </div>
      </div>

      {/* Mô tả ngắn */}
      <p className="text-gray-600 mb-6 text-sm leading-relaxed border-b border-gray-100 pb-6">
        {product.description}
      </p>

      {/* Tùy chọn (Màu/Size) */}
      <div className="space-y-6 mb-8">
        {product.options && product.options.map((option, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                {option.name}: <span className="text-[#004535] ml-1">{selectedOptions[option.name]}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {option.variants.map((variant) => {
                const isSelected = selectedOptions[option.name] === variant;
                return (
                  <button
                    key={variant}
                    onClick={() => handleOptionSelect(option.name, variant)}
                    className={`min-w-[80px] px-4 py-2 text-sm rounded-lg border transition-all ${isSelected
                      ? "border-[#004535] text-[#004535] bg-[#004535]/5 font-bold ring-1 ring-[#004535]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                  >
                    {variant}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hành động (Số lượng + Nút mua) */}
      <div className="flex flex-col sm:flex-row gap-4 mt-auto">
        {/* Bộ đếm */}
        <div className="flex items-center border border-gray-300 rounded-lg h-12 w-fit bg-white">
          <button onClick={() => handleQuantityChange('decrease')} className="w-10 h-full flex items-center justify-center hover:bg-gray-100 rounded-l-lg text-gray-600"><Minus size={16} /></button>
          <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
          <button onClick={() => handleQuantityChange('increase')} className="w-10 h-full flex items-center justify-center hover:bg-gray-100 rounded-r-lg text-gray-600"><Plus size={16} /></button>
        </div>

        {/* Nút Thêm giỏ hàng */}
        <button
          onClick={() => handleAddToCart(quantity, activeVariant)}
          disabled={isOutOfStock}
          className={`flex-1 h-12 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${isOutOfStock
            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            : "bg-[#004535] text-white hover:bg-[#003528] shadow-[#004535]/20"
            }`}
        >
          <ShoppingCart size={20} />
          {isOutOfStock ? "Đã hết hàng" : "Thêm vào giỏ hàng"}
        </button>

        {/* Nút Yêu thích */}
        <button className="h-12 w-12 border border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
          <Heart size={20} />
        </button>
      </div>

      {/* Footer nhỏ */}
      <div className="mt-6 flex items-center gap-4 text-xs text-gray-500 font-medium">
        <button className="flex items-center gap-1 hover:text-[#004535]"><Share2 size={14} /> Chia sẻ</button>
        <span>•</span>
        <span>Cam kết chính hãng 100%</span>
      </div>
    </div>
  );
};

export default ProductInfo;
