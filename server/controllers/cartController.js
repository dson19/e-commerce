import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';
import Cart from '../models/Cart.js';

const getCart = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const items = await Cart.getCart(userId);
    res.json({
        success: true,
        data: items
    });
});

const addToCart = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity, variantId } = req.body;

    if (!productId || !quantity) {
        throw new ErrorResponse("Product ID and quantity are required", 400);
    }

    const item = await Cart.addToCart(userId, productId, quantity, variantId);

    res.json({ 
        success: true, 
        data: item,
        message: "Item added to cart" 
    });
});

const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params; // Route uses :productId

    if (!productId) {
        throw new ErrorResponse("Product ID is required", 400);
    }

    await Cart.removeFromCart(userId, productId);
    
    res.json({ success: true, message: "Item removed from cart" });
});

const updateQuantity = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
        throw new ErrorResponse("Product ID and quantity are required", 400);
    }

    const item = await Cart.updateQuantity(userId, productId, quantity);
    
    res.json({ 
        success: true, 
        data: item,
        message: "Quantity updated" 
    });
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.userId;
    await Cart.clearCart(userId);
    res.json({ success: true, message: "Cart cleared" });
});

export default { getCart, addToCart, removeFromCart, updateQuantity, clearCart };


