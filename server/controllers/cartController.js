import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';
import Cart from '../models/Cart.js';

const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const items = await Cart.getCart(userId);
    res.json({
        success: true,
        data: items
    });
});

const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
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
    const userId = req.user.id;
    const { variantId } = req.params;

    if (!variantId) {
        throw new ErrorResponse("Variant ID is required", 400);
    }

    await Cart.removeFromCart(userId, variantId);

    res.json({ success: true, message: "Item removed from cart" });
});

const updateQuantity = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { variantId, quantity } = req.body;

    if (!variantId || quantity === undefined) {
        throw new ErrorResponse("Variant ID and quantity are required", 400);
    }

    const item = await Cart.updateQuantity(userId, variantId, quantity);

    res.json({
        success: true,
        data: item,
        message: "Quantity updated"
    });
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await Cart.clearCart(userId);
    res.json({ success: true, message: "Cart cleared" });
});

export default { getCart, addToCart, removeFromCart, updateQuantity, clearCart };


