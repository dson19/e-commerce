// src/components/product/ProductBreadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ProductBreadcrumb = ({ category, name }) => {
  return (
    <div className="flex text-sm text-gray-500 mb-6 gap-4 pl-5">
      <Link to="/" className="hover:text-primary">Trang chủ</Link> / 
      <Link to={`/category/${category}`} className="hover:text-primary">{category.toUpperCase()}</Link> / 
      <span className="font-semibold text-gray-800">{name}</span>
    </div>
  );
};

export default ProductBreadcrumb;