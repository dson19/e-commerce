import React from "react";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/ProductCard";
import SideBar from "../components/SideBar";
import { PRODUCTS } from "../data/mockData";
import { ChevronRight } from "lucide-react";

function HomePage() {
  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800">
      {/* Crosshatch Art - Light Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
        repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
      `,
        }}
      />
      {/* Your Content/Components */}
      <MainLayout>
        <div className="flex gap-4 relative z-10">
          {/* Sidebar đơn giản */}
          <SideBar />
          {/* Nội dung chính */}
          <div className="flex-1 w-full min-w-0">
            {/* Banner */}
            <div className="w-full h-[300px] bg-white rounded-xl shadow-sm overflow-hidden mb-6 relative">
              <img
                src="https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/07/iphone-17-pre-oder-web.png"
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Section Sản phẩm */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold uppercase text-gray-800">
                  Điện thoại nổi bật
                </h2>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  Xem tất cả <ChevronRight size={14} />
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRODUCTS.map((product) => (
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
export default HomePage;
