import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer h-full flex flex-col relative">
      {product.discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          {product.discount}
        </span>
      )}
      
      <div className="h-40 flex items-center justify-center mb-2 overflow-hidden">
        <img src={product.img} alt={product.name} className="object-contain h-full group-hover:scale-105 transition-transform duration-300" />
      </div>
      
      <div className="mt-auto">
        <h3 className="font-semibold text-gray-700 text-sm mb-1 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex flex-col">
          <span className="text-red-600 font-bold text-base">{product.price}</span>
          {product.oldPrice && (
            <span className="text-gray-400 text-xs line-through">{product.oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;