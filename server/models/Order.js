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
const cancelOrder = async (orderId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Check current status
        const checkQuery = 'SELECT status FROM orders WHERE order_id = $1';
        const checkRes = await client.query(checkQuery, [orderId]);
        if (checkRes.rows.length === 0) {
            throw new Error('Đơn hàng không tồn tại');
        }
        const currentStatus = checkRes.rows[0].status;
        if (currentStatus !== 'Pending') {
            throw new Error('Chỉ có thể hủy đơn hàng đang chờ thanh toán');
        }

        // 2. Update status to Cancelled
        const updateQuery = `
            UPDATE orders
            SET status = 'Cancelled'
            WHERE order_id = $1`;
        await client.query(updateQuery, [orderId]);

        // 3. Restore reserved stock
        // Get items in the order
        const itemsQuery = 'SELECT variant_id, quantity FROM order_items WHERE order_id = $1';
        const itemsRes = await client.query(itemsQuery, [orderId]);
        const items = itemsRes.rows;

        for (const item of items) {
            const restoreStockQuery = `
                UPDATE inventory
                SET reserved_stock = reserved_stock - $1
                WHERE variant_id = $2`;
            await client.query(restoreStockQuery, [item.quantity, item.variant_id]);
        }

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getAllOrders = async ({ limit, offset, search, status, sortBy, sortOrder }) => {
    let query = `
        SELECT o.order_id, o.user_id, o.order_date, o.grand_total, o.status,
               u.email, u.fullname
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
        query += ` AND (CAST(o.order_id AS TEXT) ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.fullname ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }

    if (status) {
        // Case insensitive check for status
        query += ` AND LOWER(o.status) = LOWER($${paramIndex})`;
        params.push(status);
        paramIndex++;
    }

    // Sort
    let sortColumn = 'o.order_date';
    if (sortBy === 'total') sortColumn = 'o.grand_total';
    else if (sortBy === 'name') sortColumn = 'u.fullname';

    const direction = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortColumn} ${direction}`;

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Count query
    let countQuery = `
        SELECT COUNT(*) 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.user_id 
        WHERE 1=1
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
        countQuery += ` AND (CAST(o.order_id AS TEXT) ILIKE $${countParamIndex} OR u.email ILIKE $${countParamIndex} OR u.fullname ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
    }
    if (status) {
        countQuery += ` AND LOWER(o.status) = LOWER($${countParamIndex})`;
        countParams.push(status);
        countParamIndex++;
    }

    const [rowsRes, countRes] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, countParams)
    ]);

    return {
        orders: rowsRes.rows,
        total: parseInt(countRes.rows[0].count)
    };
};

const updateStatus = async (orderId, status) => {
    const query = `
        UPDATE orders
        SET status = $1
        WHERE order_id = $2
        RETURNING *`;
    const res = await pool.query(query, [status, orderId]);
    return res.rows[0];
};

export default { createOrder, getOrderById, getUserOrderHistory, getOrderByIdNoUserId, updateOrderStatusToPaid, cancelOrder, getAllOrders, updateStatus };
