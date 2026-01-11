import pool from '../config/db.js';

import pool from '../config/db.js';
import Promotion from './Promotion.js'; 

// BỎ tham số discount_amount ở đầu vào
const createOrder = async (userId, items, address_id, paymentMethod, phone_number, name, promotion_id = null) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // 1. Tính Subtotal (Tổng tiền hàng gốc)
        let subtotal = 0;
        let orderItemsData = []; // Lưu tạm để đỡ query lại

        for (const item of items) {
             const variantQuery = `
                SELECT v.variant_id, COALESCE(v.price, v.best_price, v.last_price, 0) as price, 
                       v.stock, v.reserved_stock,
                       p.category_id, p.brand_id, p.id as product_id
                FROM product_variants v
                JOIN products p ON v.product_id = p.id
                JOIN inventory i ON v.variant_id = i.variant_id
                WHERE v.variant_id = $1 
                FOR UPDATE`; 

            const variantRes = await client.query(variantQuery, [item.variant_id]);
            if (variantRes.rows.length === 0) throw new Error(`Sản phẩm ${item.variant_id} không tồn tại`);
            
            const variant = variantRes.rows[0];
            if (variant.stock - variant.reserved_stock < item.quantity) throw new Error(`Sản phẩm ${item.variant_id} hết hàng`);

            const itemTotal = Number(variant.price) * item.quantity;
            subtotal += itemTotal;
            
            // Push vào mảng để tí nữa dùng tính voucher và insert
            orderItemsData.push({
                ...variant,
                quantity: item.quantity,
                itemTotal: itemTotal
            });
        }

        // 2. [LOGIC MỚI] Tự tính toán Discount từ Promotion ID (Bảo mật)
        let discount_amount = 0;
        
        if (promotion_id) {
            const voucher = await Promotion.findById(promotion_id);
            if (voucher) {
                // Check lại điều kiện (Double check cho chắc chắn)
                const now = new Date();
                if (voucher.is_active && voucher.used_count < voucher.usage_limit && 
                    new Date(voucher.start_date) <= now && new Date(voucher.end_date) >= now) {
                    
                    // Check Scope (Áp dụng cho sp nào)
                    const scopes = await Promotion.getScopes(promotion_id);
                    let eligibleAmount = 0;

                    if (scopes.length === 0) {
                        eligibleAmount = subtotal; // Toàn sàn
                    } else {
                        // Lọc sản phẩm khớp scope
                        for (const item of orderItemsData) {
                            const isMatch = scopes.some(s => 
                                (s.target_type === 'product' && s.target_id === item.product_id) ||
                                (s.target_type === 'category' && s.target_id === item.category_id) ||
                                (s.target_type === 'brand' && s.target_id === item.brand_id)
                            );
                            if (isMatch) eligibleAmount += item.itemTotal;
                        }
                    }

                    // Check Min Order
                    if (subtotal >= Number(voucher.min_order_value) && eligibleAmount > 0) {
                        // Tính tiền giảm
                        if (voucher.discount_type === 'FIXED') {
                            discount_amount = Number(voucher.discount_value);
                        } else {
                            discount_amount = (eligibleAmount * Number(voucher.discount_value)) / 100;
                            if (voucher.max_discount_amount) {
                                discount_amount = Math.min(discount_amount, Number(voucher.max_discount_amount));
                            }
                        }
                    }
                }
            }
        }

        // 3. Tính Grand Total
        let grand_total = subtotal - discount_amount;
        if (grand_total < 0) grand_total = 0;

        // 4. Tạo đơn hàng
        const orderQuery = `
            INSERT INTO orders (
                user_id, address_id, payment_method, shipping_phone, shipping_name, 
                status, grand_total, subtotal, promotion_id, discount_amount
            )
            VALUES ($1, $2, $3, $4, $5, 'Pending', $6, $7, $8, $9) 
            RETURNING order_id`;
        
        const orderRes = await client.query(orderQuery, [
            userId, address_id, paymentMethod, phone_number, name, 
            grand_total, subtotal, promotion_id, discount_amount
        ]);
        const orderId = orderRes.rows[0].order_id;

        // 5. Insert Order Items & Trừ kho
        for (const item of orderItemsData) {
            await client.query(
                `INSERT INTO order_items (order_id, variant_id, quantity, price, total_price) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.variant_id, item.quantity, item.price, item.itemTotal]
            );

            await client.query(
                `UPDATE inventory SET stock = stock - $1 WHERE variant_id = $2`,
                [item.quantity, item.variant_id]
            );
        }

        // 6. Ghi nhận dùng Voucher
        if (promotion_id && discount_amount > 0) {
            await Promotion.recordUsage(client, userId, promotion_id, orderId, discount_amount);
        }

        await client.query('COMMIT');
        return { orderId, grand_total, discount_amount };

    } catch (error) {
        await client.query('ROLLBACK');
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
