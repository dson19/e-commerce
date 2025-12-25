import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './authContext'; // Import context authentication
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // Lấy thông tin user
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Sync Cart khi User thay đổi
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        // Nếu đã đăng nhập -> Gọi API lấy giỏ hàng từ DB
        try {
          const res = await axios.get('http://localhost:5000/api/cart', { withCredentials: true });
          const mappedCart = res.data.map(item => ({
            ...item,
            id: item.id, // product id
            quantity: item.quantity
          }));
          setCartItems(mappedCart);
        } catch (error) {
          console.error("Lỗi tải giỏ hàng:", error);
          toast.error("Không thể tải giỏ hàng của bạn");
        }
      } else {
        // Nếu chưa đăng nhập -> Cart rỗng
        setCartItems([]);
      }
    };

    fetchCart();
  }, [user]);

  // 1. Hàm thêm sản phẩm
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
       toast.error("Vui lòng đăng nhập để mua hàng");
       navigate("/signIn");
       return false;
    }

    // Logic cho User (API)
    try {
        await axios.post('http://localhost:5000/api/cart/add', {
          productId: product.id,
          quantity
        }, { withCredentials: true });
        
        
        setCartItems(prev => {
           const existingItem = prev.find(item => item.id === product.id);
           if (existingItem) {
             return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
           }
           return [...prev, { ...product, quantity }];
        });
        return true;

      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Lỗi thêm vào giỏ hàng");
        return false;
      }
  };

  // 2. Hàm xóa sản phẩm
  const removeFromCart = async (id) => {
    if (!user) return; // Should not happen usually if UI hides button

    if (window.confirm('Bạn muốn xóa sản phẩm này?')) {
        try {
            await axios.delete(`http://localhost:5000/api/cart/remove/${id}`, { withCredentials: true });
            setCartItems(prev => prev.filter(item => item.id !== id));
            toast.success('Đã xóa sản phẩm');
        } catch (error) {
            console.error(error);
            toast.error("Lỗi xóa sản phẩm");
        }
    }
  };

  // 3. Hàm cập nhật số lượng
  const updateQuantity = async (id, change) => {
    if (!user) return;

    // Tính toán số lượng mới trước
    const currentItem = cartItems.find(item => item.id === id);
    if (!currentItem) return;
    const newQty = currentItem.quantity + change;
    if (newQty < 1) return;

    try {
        await axios.put('http://localhost:5000/api/cart/update', { productId: id, quantity: newQty }, { withCredentials: true });
            setCartItems(prev =>
            prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)
        );
    } catch (error) {
        console.error(error);
        toast.error("Lỗi cập nhật số lượng");
    }
  };

  // 4. Hàm xóa sạch giỏ hàng
  const clearCart = async () => {
    if (!user) {
        setCartItems([]);
        return;
    }
    try {
        await axios.delete('http://localhost:5000/api/cart/clear', { withCredentials: true });
        setCartItems([]);
    } catch (error) {
        console.error(error);
        toast.error("Lỗi xóa giỏ hàng");
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);