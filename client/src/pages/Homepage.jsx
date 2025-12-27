import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import { 
  ChevronRight, Truck, ShieldCheck, RefreshCw, Zap, Menu 
} from 'lucide-react';

const HomePage = () => {
  const featuredProducts = PRODUCTS.slice(0, 8); 

  return (
    <MainLayout>
      <div className="py-6 bg-gray-50 min-h-screen">
        
        {/* --- KHỐI TOP: SIDEBAR + BANNER (Dùng Grid 12 cột cho chuẩn tỷ lệ) --- */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          
          {/* 1. SIDEBAR (Tinh tế hơn - 3 cột) */}
          <aside className="hidden lg:block col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
              {/* Tiêu đề nhẹ nhàng hơn */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Menu size={18} className="text-[#004535]" />
                <span className="font-bold text-gray-800 uppercase text-sm tracking-wide">Danh mục sản phẩm</span>
              </div>
              
              <ul className="py-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      to={`/category/${cat.id}`} 
                      className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#004535] hover:pl-7 transition-all duration-300 group border-l-2 border-transparent hover:border-[#004535]"
                    >
                      <span className="text-gray-400 group-hover:text-[#004535] transition-colors">
                        {cat.icon}
                      </span>
                      {cat.name}
                      <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* 2. CENTER CONTENT (Banner + Service - 9 cột) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
            
            {/* HERO BANNER (Sửa lại link ảnh hoạt động) */}
            <div className="w-full h-[320px] md:h-[380px] bg-white rounded-2xl shadow-sm overflow-hidden relative group">
              {/* Ảnh Demo từ Apple (Link này chắc chắn sống) */}
              <img 
                src="https://www.apple.com/newsroom/images/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/tile/Apple-iPhone-15-Pro-lineup-hero-230912.jpg.landing-big_2x.jpg" 
                alt="Banner iPhone 15 Pro" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Overlay Text (Làm tối góc ảnh để chữ nổi lên) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent flex flex-col justify-center px-10">
                 <div className="text-white transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="bg-[#004535] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-3 inline-block shadow-lg">Flagship 2024</span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">iPhone 15 Pro Max</h2>
                    <p className="text-gray-200 text-sm md:text-base max-w-md mb-6">Titanium bền bỉ. Chip A17 Pro định hình tương lai. Camera zoom quang 5x đỉnh cao.</p>
                    <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-[#004535] hover:text-white transition-all shadow-lg">
                      Mua ngay
                    </button>
                 </div>
              </div>
            </div>

            {/* SERVICE BAR (Thanh ngang nhỏ gọn) */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
               {[
                 { icon: <Truck size={20}/>, title: "Free Ship", sub: "Đơn > 5tr" },
                 { icon: <ShieldCheck size={20}/>, title: "Bảo hành 12T", sub: "Chính hãng" },
                 { icon: <RefreshCw size={20}/>, title: "Đổi trả 30 ngày", sub: "Lỗi là đổi" },
                 { icon: <Zap size={20}/>, title: "Giao 2H", sub: "Nội thành" },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-center gap-3 px-2 first:pl-0 last:pr-0">
                    <div className="text-[#004535]">
                       {item.icon}
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-gray-800 text-sm leading-tight">{item.title}</p>
                       <p className="text-[10px] text-gray-500">{item.sub}</p>
                    </div>
                 </div>
               ))}
            </div>

          </div>
        </div>

        {/* --- KHỐI SẢN PHẨM --- */}
        <div className="space-y-8">
          
          {/* SECTION 1: SẢN PHẨM NỔI BẬT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#004535]"></span> {/* Vạch màu nhỏ tinh tế */}
                Sản phẩm nổi bật
              </h2>
              <Link to="/products" className="text-xs font-bold text-[#004535] uppercase tracking-wide hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={14}/>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* BANNER QUẢNG CÁO PHỤ (Làm đẹp layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="h-40 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-between px-8 relative overflow-hidden group cursor-pointer">
                <div className="z-10">
                   <p className="text-gray-400 text-xs font-bold uppercase mb-1">Apple Watch</p>
                   <h3 className="text-white text-2xl font-bold">Series 9</h3>
                   <span className="text-white/80 text-xs">Giảm ngay 15%</span>
                </div>
                {/* Trang trí */}
                <div className="absolute w-32 h-32 bg-white/10 rounded-full -right-4 -bottom-4 blur-2xl group-hover:bg-white/20 transition-all"></div>
             </div>
             <div className="h-40 rounded-xl bg-gradient-to-r from-[#004535] to-[#00604b] flex items-center justify-between px-8 relative overflow-hidden group cursor-pointer">
                <div className="z-10">
                   <p className="text-green-200 text-xs font-bold uppercase mb-1">Âm thanh</p>
                   <h3 className="text-white text-2xl font-bold">AirPods Pro</h3>
                   <span className="text-white/80 text-xs">Chống ồn chủ động</span>
                </div>
                 {/* Trang trí */}
                 <div className="absolute w-32 h-32 bg-white/10 rounded-full -right-4 -top-4 blur-2xl group-hover:bg-white/20 transition-all"></div>
             </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;