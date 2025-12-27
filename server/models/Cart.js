import pool from '../config/db.js';

const getCart = async (userId) => {
    const query = `
        SELECT c.quantity, p.id, p.name, p.price, p.img, p.category, p.discount, p.old_price as "oldPrice"
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
};

const addToCart = async (userId, productId, quantity) => {
    const query = `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, product_id) 
        DO UPDATE SET quantity = cart_items.quantity + $3
        RETURNING *
    `;
    const res = await pool.query(query, [userId, productId, quantity]);
    return res.rows[0];
};

const removeFromCart = async (userId, productId) => {
    const query = 'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *';
    const res = await pool.query(query, [userId, productId]);
    return res.rows[0];
};

const updateQuantity = async (userId, productId, quantity) => {
    const query = 'UPDATE cart_items SET quantity = $3 WHERE user_id = $1 AND product_id = $2 RETURNING *';
    const res = await pool.query(query, [userId, productId, quantity]);
    return res.rows[0];
};

const clearCart = async (userId) => {
    const query = 'DELETE FROM cart_items WHERE user_id = $1';
    await pool.query(query, [userId]);
};

export default { getCart, addToCart, removeFromCart, updateQuantity, clearCart };
