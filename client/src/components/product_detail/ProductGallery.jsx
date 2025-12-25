// src/components/product/ProductGallery.jsx
import React from 'react';

const ProductGallery = ({ gallery, mainImage, setMainImage, productName }) => {
  return (
    <div>
      {/* Ảnh chính */}
      <div className="p-4 bg-gray-100 rounded-t-lg flex items-center justify-center h-[450px] mb-4">
        <img src={mainImage} alt={productName} className="w-full h-full object-contain" />
      </div>
      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {gallery.map(img => (
          <img
            key={img.id}
            src={img.url}
            alt="thumb"
            className={`w-20 h-20 object-contain p-1 border rounded-lg cursor-pointer transition-all ${
              mainImage === img.url ? 'border-primary shadow-md' : 'border-gray-200'
            }`}
            onClick={() => setMainImage(img.url)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;