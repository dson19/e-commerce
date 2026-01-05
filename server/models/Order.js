import pool from '../config/db.js';

const createOrder = async (userId, items, address_id, paymentMethod, phone_number, name) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let calculatedGrandTotal = 0;

        // 1. Tạo đơn hàng trước (Status Pending, Total tạm để 0)
        const orderQuery = `
            INSERT INTO orders (user_id, address_id, payment_method, shipping_phone, shipping_name, status, grand_total, subtotal)
            VALUES ($1, $2, $3, $4, $5, 'Pending', 0, 0) 
            RETURNING order_id`;
        // grand_total và subtotal để tạm là 0, sau khi tính toán xong items sẽ update lại
        const orderRes = await client.query(orderQuery, [userId, address_id, paymentMethod, phone_number, name]);
        const orderId = orderRes.rows[0].order_id;

        for (const item of items) {

            const variantQuery = `
                SELECT COALESCE(price, best_price, last_price, 0) as price, stock, reserved_stock 
                FROM product_variants 
                JOIN inventory ON product_variants.variant_id = inventory.variant_id
                WHERE product_variants.variant_id = $1 
                FOR UPDATE`;

            const variantRes = await client.query(variantQuery, [item.variant_id]);

            if (variantRes.rows.length === 0) {
                throw new Error(`Sản phẩm ID ${item.variant_id} không tồn tại`);
            }

            const productData = variantRes.rows[0];
            const availableStock = (productData.stock || 0) - (productData.reserved_stock || 0);

            if (availableStock < item.quantity) {
                throw new Error(`Sản phẩm ${item.variant_id} không đủ hàng (Còn: ${availableStock})`);
            }

            const insertItemQuery = `
                INSERT INTO order_items (order_id, variant_id, quantity, price)
                VALUES ($1, $2, $3, $4)`;
            await client.query(insertItemQuery, [orderId, item.variant_id, item.quantity, productData.price]);

            const updateStockQuery = `
                UPDATE inventory 
                SET reserved_stock = reserved_stock + $1 
                WHERE variant_id = $2`;
            await client.query(updateStockQuery, [item.quantity, item.variant_id]);

            calculatedGrandTotal += Number(productData.price) * item.quantity;
        }

        await client.query('UPDATE orders SET grand_total = $1, subtotal = $1 WHERE order_id = $2', [calculatedGrandTotal, orderId]);

        await client.query('COMMIT');
        return { order_id: orderId, total: calculatedGrandTotal };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi tạo đơn hàng:", error.message);
        throw error;
    } finally {
        client.release();
    }
};
const getOrderById = async (userId, orderId) => {
    const orderQuery = `
        SELECT o.*, o.order_date as created_at,
        a.street, a.ward, a.district, a.city,
        json_agg(json_build_object(
            'product_name', p.name,
            'color', pv.color,
            'price', oi.price,
            'quantity', oi.quantity,
            'img', pv.image_url
        )) AS items
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
        LEFT JOIN products p ON pv.product_id = p.id
        LEFT JOIN addresses a ON o.address_id = a.address_id
        WHERE o.order_id = $1 AND o.user_id = $2
        GROUP BY o.order_id, a.address_id`;
    const orderValues = [orderId, userId];
    const orderRes = await pool.query(orderQuery, orderValues);
    if (orderRes.rows.length === 0) {
        return null;
    }
    return orderRes.rows[0];
};
const getUserOrderHistory = async (userId) => {
    const ordersQuery = `
        SELECT o.*, o.order_date as created_at,
        json_agg(json_build_object(
            'product_name', p.name,
            'color', pv.color,
            'price', oi.price,
            'quantity', oi.quantity,
            'img', pv.image_url
        )) AS items
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
        LEFT JOIN products p ON pv.product_id = p.id
        WHERE o.user_id = $1
        GROUP BY o.order_id
        ORDER BY o.order_date DESC`;
    const ordersValues = [userId];
    const ordersRes = await pool.query(ordersQuery, ordersValues);
    return ordersRes.rows;
};
const getOrderByIdNoUserId = async (orderId) => {
    const orderQuery = `
        SELECT o.*, o.order_date as created_at,
        a.street, a.ward, a.district, a.city,
        json_agg(json_build_object(
            'product_name', p.name,
            'color', pv.color,
            'price', oi.price,
            'quantity', oi.quantity,
            'img', pv.image_url
        )) AS items
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
        LEFT JOIN products p ON pv.product_id = p.id
        LEFT JOIN addresses a ON o.address_id = a.address_id
        WHERE o.order_id = $1
        GROUP BY o.order_id, a.address_id`;
    const orderValues = [orderId];
    const orderRes = await pool.query(orderQuery, orderValues);
    if (orderRes.rows.length === 0) {
        return null;
    }
    return orderRes.rows[0];
};
const updateOrderStatusToPaid = async (orderId) => {
    const query = `
        UPDATE orders
        SET status = 'paid'
        WHERE order_id = $1`;
    const values = [orderId];
    await pool.query(query, values);
}
const checkOrderStatus = async (orderId) => {
    const query = `
        SELECT status
        FROM orders
        WHERE order_id = $1`;
    const values = [orderId];
    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
        return null;
    }
    return res.rows[0].status;
}
export default { createOrder, getOrderById, getUserOrderHistory, getOrderByIdNoUserId, updateOrderStatusToPaid };