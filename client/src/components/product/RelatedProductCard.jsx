import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { slugify } from '@/utils/slugify';

const RelatedProductCard = ({ product }) => {
    // Determine slugs
    const parentSlug = slugify(product.parentCategory || 'san-pham');
    const categorySlug = slugify(product.category || product.brand || 'khac');
    const productSlug = product.slug || slugify(product.name);

    // Construct friendly URL
    const productUrl = `/${parentSlug}/${categorySlug}/${productSlug}?sku=${product.sku || `SP-${product.id}`}`;

    return (
        <Link
            to={productUrl}
            className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer h-full flex flex-col relative"
        >
            {/* Badge Giảm giá */}
            {product.discount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                    {product.discount}
                </div>
            )}

            {/* Ảnh sản phẩm */}
            <div className="h-40 mb-3 flex items-center justify-center overflow-hidden p-2">
                <img
                    src={product.img ? product.img.split(';')[0] : "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Thông tin */}
            <div className="flex flex-col flex-1">
                <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2 min-h-[40px] group-hover:text-[#004535] transition-colors">
                    {product.name}
                </h3>

                <div className="mt-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-base">{formatCurrency(product.price)}</span>
                        {product.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">{formatCurrency(product.oldPrice)}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Button thêm nhanh (hiện khi hover trên Desktop) */}
            <div className="hidden lg:flex absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-[#004535] text-white flex items-center justify-center shadow-lg hover:bg-[#003528]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                </div>
            </div>
        </Link>
    );
};

export default RelatedProductCard;