import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { cartService } from '../services/api';
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

  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Helper to sanitize product data for Cart
  const sanitizeCartItem = (item) => ({
    ...item,
    id: Number(item.id),
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
    oldPrice: Number(item.oldPrice) || 0,
    options: item.color ? { "Màu sắc": item.color } : (item.options || {})
  });

  // Sync Cart khi User thay đổi
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        dispatch({ type: 'SET_LOADING' });
        try {
          const res = await cartService.getCart();
          const cartData = res.data.data || [];
          const mappedCart = cartData.map(item => sanitizeCartItem(item));
          dispatch({ type: 'SET_CART', payload: mappedCart });
        } catch (error) {
          console.error("Lỗi tải giỏ hàng:", error);
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

      await cartService.addToCart({
        productId: product.id,
        quantity,
        variantId: product.selectedVariant?.id || product.variantId
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
    if (!user) return;

    if (window.confirm('Bạn muốn xóa sản phẩm này?')) {
      try {
        await cartService.removeFromCart(id);
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
      await cartService.updateQuantity({ productId: id, quantity: newQty });
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
      await cartService.clearCart();
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};