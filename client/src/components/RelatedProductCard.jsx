// RelatedProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; 

const RelatedProductCard = ({ product }) => {
    return (
        <Link 
            to={`/product/${product.id}`} 
            className="block group bg-white p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
            <div className="flex justify-center items-center h-32 mb-2 relative">
                <img 
                    src={product.img.split(';')[0]} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {product.discount && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-bl-lg">
                        {product.discount}
                    </span>
                )}
            </div>

            <h3 className="text-sm font-medium text-gray-700 h-10 overflow-hidden group-hover:text-primary transition-colors">
                {product.name}
            </h3>
            <div className="flex items-baseline mt-2">
                <span className="text-base font-bold text-red-600 mr-2">{product.price}</span>
                <span className="text-xs text-gray-400 line-through">{product.oldPrice}</span>
            </div>           
        </Link>
    );
};

export default RelatedProductCard;