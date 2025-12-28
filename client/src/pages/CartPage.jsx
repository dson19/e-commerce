import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ArrowLeft } from 'lucide-react';
import { useCart } from "@/context/CartContext";
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  // --- HÀM XỬ LÝ GIÁ TIỀN (FIX LỖI NaN) ---
  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    // Chuyển "22.090.000₫" -> thành số 22090000
    return parseInt(price.toString().replace(/[^0-9]/g, ''), 10);
  };

  // Tính tổng tiền (Dùng hàm parsePrice bọc lấy item.price)
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (parsePrice(item.price) * item.quantity);
  }, 0);

  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <EmptyCart />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 mb-6">
        <Link to="/" className="hover:text-[#004535] transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Giỏ hàng</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-semibold text-gray-700 border-b border-gray-100">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-center">Thành tiền</div>
            </div>

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeFromCart}
                  // Truyền hàm parsePrice xuống component con để dùng
                  parsePrice={parsePrice}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-[#004535] font-medium hover:underline">
              <ArrowLeft size={18} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <CartSummary subtotal={subtotal} total={total} />

      </div>
    </MainLayout>
  );
};

export default CartPage;