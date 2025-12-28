import React, { createContext, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './authContext'; // Import context authentication
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialState = {
    items: [],
    loading: false,
    error: null
  };

  const cartReducer = (state, action) => {
    switch (action.type) {
      case 'SET_CART':
        return { ...state, items: action.payload, loading: false, error: null };
      case 'ADD_ITEM': {
        const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += action.payload.quantity;
          return { ...state, items: newItems };
        }
        return { ...state, items: [...state.items, action.payload] };
      }
      case 'REMOVE_ITEM':
        return { ...state, items: state.items.filter(item => item.id !== action.payload) };
      case 'UPDATE_QUANTITY':
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
          )
        };
      case 'CLEAR_CART':
        return { ...state, items: [] };
      case 'SET_LOADING':
        return { ...state, loading: true };
      case 'SET_ERROR':
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = React.useReducer(cartReducer, initialState);

  // Helper to sanitize product data for Cart
  const sanitizeCartItem = (item) => ({
    ...item,
    id: Number(item.id),
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
    oldPrice: Number(item.oldPrice) || 0,
    // Map flat color to options object for CartItem display
    options: item.color ? { "Màu sắc": item.color } : (item.options || {})
  });

  // Sync Cart khi User thay đổi
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        dispatch({ type: 'SET_LOADING' });
        try {
          const res = await axios.get('http://localhost:5000/api/cart', { withCredentials: true });
          console.log("[CART_CONTEXT] API Response:", res.data);
          const mappedCart = res.data.map(item => sanitizeCartItem(item));
          console.log("[CART_CONTEXT] Mapped Cart:", mappedCart);
          dispatch({ type: 'SET_CART', payload: mappedCart });
        } catch (error) {
          console.error("Lỗi tải giỏ hàng:", error);
          console.error("[CART_CONTEXT] API Error Details:", error.response?.data);
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
      } else {
        dispatch({ type: 'SET_CART', payload: [] });
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

    try {
      // Optimistic Update
      dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });

      await axios.post('http://localhost:5000/api/cart/add', {
        productId: product.id,
        quantity,
        variantId: product.selectedVariant?.id || product.variantId
      }, { withCredentials: true });

      return true;

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi thêm vào giỏ hàng");
      // Revert or fetch cart again on error? For now simple toast.
      return false;
    }
  };

  // 2. Hàm xóa sản phẩm
  const removeFromCart = async (id) => {
    if (!user) return;

    if (window.confirm('Bạn muốn xóa sản phẩm này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/cart/remove/${id}`, { withCredentials: true });
        dispatch({ type: 'REMOVE_ITEM', payload: id });
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

    const currentItem = state.items.find(item => item.id === id);
    if (!currentItem) return;
    const newQty = currentItem.quantity + change;
    if (newQty < 1) return;

    try {
      await axios.put('http://localhost:5000/api/cart/update', { productId: id, quantity: newQty }, { withCredentials: true });
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQty } });
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật số lượng");
    }
  };

  // 4. Hàm xóa sạch giỏ hàng
  const clearCart = async () => {
    if (!user) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    try {
      await axios.delete('http://localhost:5000/api/cart/clear', { withCredentials: true });
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xóa giỏ hàng");
    }
  };

  return (
    <CartContext.Provider value={{ cartItems: state.items, loading: state.loading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);