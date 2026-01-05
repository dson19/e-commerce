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
        const itemIdentifier = (item) => item.variant_id || item.selectedVariant?.id || item.variantId || item.id;
        const newItemIdentifier = itemIdentifier(action.payload);
        const existingItemIndex = state.items.findIndex(item => itemIdentifier(item) === newItemIdentifier);

        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += action.payload.quantity;
          return { ...state, items: newItems };
        }
        return { ...state, items: [...state.items, action.payload] };
      }
      case 'REMOVE_ITEM':
        return {
          ...state,
          items: state.items.filter(item => (item.variant_id || item.selectedVariant?.id || item.variantId || item.id) !== action.payload)
        };
      case 'UPDATE_QUANTITY':
        return {
          ...state,
          items: state.items.map(item =>
            (item.variant_id || item.selectedVariant?.id || item.variantId || item.id) === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
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
    variant_id: Number(item.variant_id || item.variantId),
    quantity: Number(item.quantity) || 1,
    price: item.price, // Keep original type for internal parsing
    oldPrice: item.oldPrice,
    img: item.img || item.image_url || item.image,
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

    const variantId = product.selectedVariant?.id || product.variantId || product.variant_id || product.id;

    try {
      // Optimistic Update
      dispatch({ type: 'ADD_ITEM', payload: { ...product, variant_id: variantId, quantity } });

      await cartService.addToCart({
        productId: product.id,
        quantity,
        variantId: variantId
      });

      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi thêm vào giỏ hàng");
      return false;
    }
  };

  // 2. Hàm xóa sản phẩm
  const removeFromCart = async (variantId) => {
    if (!user) return;
      try {
        await cartService.removeFromCart(variantId);
        dispatch({ type: 'REMOVE_ITEM', payload: variantId });
        toast.success('Đã xóa sản phẩm');
      } catch (error) {
        console.error(error);
        toast.error("Lỗi xóa sản phẩm");
      }
  };

  // 3. Hàm cập nhật số lượng
  const updateQuantity = async (variantId, change) => {
    if (!user) return;

    const currentItem = state.items.find(item => (item.variant_id || item.selectedVariant?.id || item.variantId || item.id) === variantId);
    if (!currentItem) return;
    const newQty = currentItem.quantity + change;
    if (newQty < 1) return;

    try {
      await cartService.updateQuantity({ variantId: variantId, quantity: newQty });
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: variantId, quantity: newQty } });
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