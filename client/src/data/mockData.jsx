import React from 'react';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Monitor, 
  Headphones, 
  Watch, 
  Speaker, 
  Camera 
} from 'lucide-react';

// --- DANH MỤC (Vẫn giữ để Sidebar đẹp, hoặc bạn có thể sửa thành các Hãng) ---
export const CATEGORIES = [
  { id: 'apple', name: 'Apple (iPhone)', icon: <Smartphone size={18} /> },
  { id: 'samsung', name: 'Samsung', icon: <Smartphone size={18} /> },
  { id: 'xiaomi', name: 'Xiaomi', icon: <Smartphone size={18} /> },
  { id: 'oppo', name: 'OPPO', icon: <Smartphone size={18} /> },
  { id: 'nokia', name: 'Nokia', icon: <Smartphone size={18} /> },
  { id: 'realme', name: 'Realme', icon: <Smartphone size={18} /> },
];

// --- 12 ĐIỆN THOẠI (IPHONE - SAMSUNG - XIAOMI) ---
export const PRODUCTS = [
  // --- APPLE IPHONE ---
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max 256GB VN/A', 
    price: '28.990.000 ₫', 
    oldPrice: '34.990.000 ₫', 
    discount: '-17%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2023/09/13/iphone-15-pro-max-natural-titanium-pure-back-iphone-15-pro-max-natural-titanium-pure-front-2up-screen-usen-1.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'apple'
  },
  { 
    id: 2, 
    name: 'iPhone 15 Plus 128GB VN/A', 
    price: '22.090.000 ₫', 
    oldPrice: '25.990.000 ₫', 
    discount: '-15%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2023/09/13/iphone-15-plus-blue-pure-back-iphone-15-plus-blue-pure-front-2up-screen-usen.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'apple'
  },
  { 
    id: 3, 
    name: 'iPhone 13 128GB Chính hãng VN/A', 
    price: '13.590.000 ₫', 
    oldPrice: '17.990.000 ₫', 
    discount: '-24%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2023/07/18/13-removebg-preview.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'apple'
  },
  { 
    id: 4, 
    name: 'iPhone 11 64GB Chính hãng VN/A', 
    price: '8.450.000 ₫', 
    oldPrice: '11.990.000 ₫', 
    discount: '-29%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2023/10/18/iphone-11-white-2-up-vertical-us-en-screen-1.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'apple'
  },

  // --- SAMSUNG ---
  { 
    id: 5, 
    name: 'Samsung Galaxy S24 Ultra 256GB', 
    price: '26.990.000 ₫', 
    oldPrice: '33.990.000 ₫', 
    discount: '-21%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2024/01/16/s24-ultra-vang_638409930027889246.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'samsung'
  },
  { 
    id: 6, 
    name: 'Samsung Galaxy Z Flip5 256GB', 
    price: '16.990.000 ₫', 
    oldPrice: '25.990.000 ₫', 
    discount: '-35%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2024/03/28/z-flip5-xanh.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'samsung'
  },
  { 
    id: 7, 
    name: 'Samsung Galaxy A55 5G 8GB/128GB', 
    price: '9.290.000 ₫', 
    oldPrice: '9.990.000 ₫', 
    discount: '-7%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2025/03/24/a55-iceblue.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'samsung'
  },
  { 
    id: 8, 
    name: 'Samsung Galaxy M14 5G 4GB/64GB', 
    price: '3.190.000 ₫', 
    oldPrice: '3.690.000 ₫', 
    discount: '-13%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2025/03/21/a06-5g-light-green.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'samsung'
  },

  // --- XIAOMI ---
  { 
    id: 9, 
    name: 'Xiaomi 14 5G 12GB/256GB', 
    price: '19.990.000 ₫', 
    oldPrice: '22.990.000 ₫', 
    discount: '-13%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2025/06/25/reno14-5g-combo-product-white.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'xiaomi'
  },
  { 
    id: 10, 
    name: 'Xiaomi Redmi Note 13 Pro 8GB/128GB', 
    price: '6.790.000 ₫', 
    oldPrice: '7.290.000 ₫', 
    discount: '-6%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2024/02/20/redmi-note-13-pro.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'xiaomi'
  },
  { 
    id: 11, 
    name: 'Xiaomi Redmi 13C 4GB/128GB', 
    price: '2.990.000 ₫', 
    oldPrice: '3.290.000 ₫', 
    discount: '-9%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2025/01/06/xiaomi-redmi-14c-thumb.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'xiaomi'
  },
  { 
    id: 12, 
    name: 'POCO M6 Pro 8GB/256GB', 
    price: '5.490.000 ₫', 
    oldPrice: '6.490.000 ₫', 
    discount: '-15%', 
    img: 'https://cdn.hoanghamobile.vn/Uploads/2025/09/08/poco-m6-purple-1.png;trim.threshold=80;trim.percentpadding=0.5;width=180;height=180;mode=pad;',
    category: 'xiaomi'
  },
];
