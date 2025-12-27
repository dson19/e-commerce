import pool from '../config/db.js';

// Helper: Ensure Cart Exists
const getCartId = async (userId) => {
    let res = await pool.query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) {
        res = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id', [userId]);
    }
    return res.rows[0].cart_id;
};

const getCart = async (userId) => {
    // Join carts -> cart_items -> product_variants -> products
    const query = `
        SELECT 
            ci.quantity, 
            p.id, 
            p.name, 
            pv.price, 
            pv.image_url as img, 
            pv.original_price as "oldPrice",
            ci.variant_id
        FROM carts c
        JOIN cart_items ci ON c.cart_id = ci.cart_id
        JOIN product_variants pv ON ci.variant_id = pv.variant_id
        JOIN products p ON pv.product_id = p.id
        WHERE c.user_id = $1
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
};

const addToCart = async (userId, productId, quantity) => {
    const cartId = await getCartId(userId);

    // Find a variant for this product. 
    // TODO: Support selecting specific variants from Frontend. 
    // For now, default to the first variant found.
    const variantRes = await pool.query('SELECT variant_id FROM product_variants WHERE product_id = $1 LIMIT 1', [productId]);
    
    if (variantRes.rows.length === 0) {
        throw new Error('Product not available (no variants found)');
    }
    const variantId = variantRes.rows[0].variant_id;

    // Insert or Update Quantity
    const query = `
        INSERT INTO cart_items (cart_id, variant_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (cart_id, variant_id) 
        DO UPDATE SET quantity = cart_items.quantity + $3
        RETURNING *
    `;
    const res = await pool.query(query, [cartId, variantId, quantity]);
    return res.rows[0];
};

const removeFromCart = async (userId, productId) => {
    // Remove ALL items associated with this product ID (all variants)
    // Or just the specific variant if we knwo it. 
    // Since frontend sends productId, we remove all variants of this product for now to be safe/consistent.
    const cartId = await getCartId(userId);
    
    // Find variants to remove
    const query = `
        DELETE FROM cart_items 
        WHERE cart_id = $1 
        AND variant_id IN (SELECT variant_id FROM product_variants WHERE product_id = $2)
        RETURNING *
    `;
    const res = await pool.query(query, [cartId, productId]);
    return res.rows;
};

const updateQuantity = async (userId, productId, quantity) => {
    const cartId = await getCartId(userId);
    
    // Update quantity for the first variant found (simplistic)
    // A better approach would be to pass variantId from frontend.
    const variantRes = await pool.query('SELECT variant_id FROM product_variants WHERE product_id = $1 LIMIT 1', [productId]);
    if (variantRes.rows.length === 0) return null;
    const variantId = variantRes.rows[0].variant_id;

    const query = 'UPDATE cart_items SET quantity = $3 WHERE cart_id = $1 AND variant_id = $2 RETURNING *';
    const res = await pool.query(query, [cartId, variantId, quantity]);
    return res.rows[0];
};

const clearCart = async (userId) => {
    const cartId = await getCartId(userId);
    const query = 'DELETE FROM cart_items WHERE cart_id = $1';
    await pool.query(query, [cartId]);
};

export default { getCart, addToCart, removeFromCart, updateQuantity, clearCart };
