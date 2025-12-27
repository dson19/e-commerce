import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ProductBreadcrumb = ({ category, name }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-hidden whitespace-nowrap">
      <Link to="/" className="hover:text-[#004535] transition-colors flex items-center">
        <Home size={16} />
      </Link>
      
      <ChevronRight size={14} className="mx-2 shrink-0" />
      
      <Link to={`/category/${category}`} className="hover:text-[#004535] transition-colors capitalize">
        {category}
      </Link>
      
      <ChevronRight size={14} className="mx-2 shrink-0" />
      
      <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md">
        {name}
      </span>
    </nav>
  );
};

export default ProductBreadcrumb;