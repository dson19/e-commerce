import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy dữ liệu từ LocalStorage khi mới vào web
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Tự động lưu vào LocalStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. Hàm thêm sản phẩm
  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        // Nếu có rồi -> Tăng số lượng lên
        toast.success(`Đã tăng số lượng ${product.name}`);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Nếu chưa có -> Thêm mới vào
        toast.success('Đã thêm vào giỏ hàng');
        return [...prev, { ...product, quantity }];
      }
    });
  };

  // 2. Hàm xóa sản phẩm
  const removeFromCart = (id) => {
    if (window.confirm('Bạn muốn xóa sản phẩm này?')) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Đã xóa sản phẩm');
    }
  };

  // 3. Hàm cập nhật số lượng (Tăng/Giảm)
  const updateQuantity = (id, change) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + change;
          // Không cho giảm dưới 1
          if (newQty < 1) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // 4. Hàm xóa sạch giỏ hàng (khi thanh toán xong)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);