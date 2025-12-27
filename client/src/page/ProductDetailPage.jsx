import React from 'react'
import ProductDetail from '@/components/ProductDetail'
import MainLayout from '@/layouts/MainLayout'
const ProductDetailPage = () => {
  return (
    <div className="min-h-screen w-full relative">
  {/* Radial Gradient Background from Bottom */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)",
    }}
  />
  {/* Your Content/Components */}
    <MainLayout>
    <div className="relative z-10">
      <ProductDetail />
    </div>
    </MainLayout>
    </div>
    )
}

export default ProductDetailPage
