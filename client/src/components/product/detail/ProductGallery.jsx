import React from 'react';

const ProductGallery = ({ gallery, mainImage, setMainImage, onImageSelect }) => {
  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 h-full">
      {/* Thumbnails (Dọc bên trái trên Desktop, Ngang ở dưới trên Mobile) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] no-scrollbar py-1 lg:py-0">
        {gallery.map((img) => (
          <button
            key={img.id}
            onClick={() => onImageSelect ? onImageSelect(img) : setMainImage(img.url)}
            className={`w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden bg-white p-1 transition-all ${mainImage === img.url
              ? "border-[#004535] opacity-100"
              : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"
              }`}
          >
            <img
              src={img.url}
              alt="Thumbnail"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </button>
        ))}
      </div>

      {/* Ảnh chính (Main Image) */}
      <div className="flex-1 bg-white rounded-2xl flex items-center justify-center p-4 relative group min-h-[300px] lg:min-h-[500px]">
        <img
          src={mainImage}
          alt="Main Product"
          className="w-full h-full object-contain max-h-[400px] lg:max-h-[500px] mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge Mới/Hot nếu cần */}
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          HOT
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;