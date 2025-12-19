import React from 'react';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import { ChevronRight } from 'lucide-react';
function Homepage() {

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
      <div className="flex gap-4 relative z-10">
        {/* Sidebar đơn giản */}
        <aside className="w-[220px] bg-white rounded-lg shadow-sm h-fit hidden lg:block overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700 text-sm uppercase">Danh mục</div>
          <ul>
            {CATEGORIES.map(cat => (
              <li key={cat.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:font-medium transition-all">
                  {cat.icon} {cat.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Nội dung chính */}
        <div className="flex-1 w-full min-w-0">
          {/* Banner */}
          <div className="w-full h-[300px] bg-white rounded-xl shadow-sm overflow-hidden mb-6 relative">
             <img src="https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/07/iphone-17-pre-oder-web.png" alt="Banner" className="w-full h-full object-cover"/>
          </div>

          {/* Section Sản phẩm */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold uppercase text-gray-800">Điện thoại nổi bật</h2>
              <a href="#" className="text-sm text-primary hover:underline flex items-center">Xem tất cả <ChevronRight size={14}/></a>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
</div>
  );
}

export default Homepage;

