import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 max-w-[1200px]">

        {/* --- PHẦN 2: MAIN FOOTER (4 Cột) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Cột 1: Brand & Social */}
          <div className="lg:pr-8">
            <Link to="/" className="text-2xl font-bold text-[#004535] mb-6 block">
              MobileStore<span className="text-green-500">.</span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Chào mừng đến với MobileStore, điểm đến cuối cùng cho các thiết bị thông minh mới nhất. Chúng tôi mang đến những gì tốt nhất.
            </p>
            <div className="flex gap-3">
              {[<Facebook size={18}/>, <Instagram size={18}/>, <Twitter size={18}/>, <Linkedin size={18}/>].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#004535] hover:text-white transition-all duration-300">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Cột 2: SẢN PHẨM */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Sản phẩm</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/category/headphones" className="hover:text-[#004535] transition-colors">Tai nghe</Link></li>
              <li><Link to="/category/smartphones" className="hover:text-[#004535] transition-colors">Điện thoại</Link></li>
              <li><Link to="/category/laptops" className="hover:text-[#004535] transition-colors">Laptop</Link></li>
              <li><Link to="/category/watches" className="hover:text-[#004535] transition-colors">Đồng hồ</Link></li>
            </ul>
          </div>

          {/* Cột 3: WEBSITE */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Website</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-[#004535] transition-colors">Trang chủ</Link></li>
              <li><Link to="/about" className="hover:text-[#004535] transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="hover:text-[#004535] transition-colors">Liên hệ</Link></li>
              <li><Link to="/faq" className="hover:text-[#004535] transition-colors">Trợ giúp</Link></li>
            </ul>
          </div>

          {/* Cột 4: LIÊN HỆ */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <Phone size={18} className="shrink-0 mt-0.5" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="shrink-0 mt-0.5" />
                <span>contact@mobilestore.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>123 Cầu Giấy, Hà Nội</span>
              </li>
            </ul>
          </div>

        </div>

        {/* --- PHẦN 3: COPYRIGHT --- */}
        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} MobileStore All Right Reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;