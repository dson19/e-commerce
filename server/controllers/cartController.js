import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const query = `
        SELECT c.*, p.name, p.img, p.min_price, 
               pv.best_price as variant_price, pv.color as variant_color, pv.sku as variant_sku
        FROM cart c
        JOIN products p ON c.product_id = p.id
        LEFT JOIN product_variants pv ON c.variant_id = pv.variant_id
        WHERE c.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    res.json({
        success: true,
        data: result.rows
    });
});

const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { product_id, variant_id, quantity } = req.body;

    // Check if item already exists
    const checkQuery = `SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND (variant_id = $3 OR (variant_id IS NULL AND $3 IS NULL))`;
    const checkResult = await pool.query(checkQuery, [userId, product_id, variant_id]);

    if (checkResult.rows.length > 0) {
        const updateQuery = `UPDATE cart SET quantity = quantity + $1 WHERE cart_id = $2`;
        await pool.query(updateQuery, [quantity, checkResult.rows[0].cart_id]);
    } else {
        const insertQuery = `INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4)`;
        await pool.query(insertQuery, [userId, product_id, variant_id, quantity]);
    }

    res.json({ success: true, message: "Item added to cart" });
});

const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cart_id } = req.params;
    await pool.query('DELETE FROM cart WHERE cart_id = $1 AND user_id = $2', [cart_id, userId]);
    res.json({ success: true, message: "Item removed from cart" });
});

const updateQuantity = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cart_id, quantity } = req.body;
    await pool.query('UPDATE cart SET quantity = $1 WHERE cart_id = $2 AND user_id = $3', [quantity, cart_id, userId]);
    res.json({ success: true, message: "Quantity updated" });
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);
    res.json({ success: true, message: "Cart cleared" });
});

export default { getCart, addToCart, removeFromCart, updateQuantity, clearCart };
