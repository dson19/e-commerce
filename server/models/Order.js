import pool from '../config/db.js';
import Promotion from './Promotion.js';
import Product from './Product.js';
const createOrder = async (userId, items, address_id, paymentMethod, phone_number, name, promotion_id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let calculatedGrandTotal = 0;
        let orderItemsInfo = []; // Lưu thông tin để tính promotion (brand, category...)

        // 1. Tạo đơn hàng trước (Status Pending, Total tạm để 0)
        // Thêm cột promotion_id và discount_amount vào câu lệnh INSERT (nếu DB có cột này) hoặc UPDATE sau
        // Ở đây mình sẽ UPDATE sau khi tính xong
        const orderQuery = `
            INSERT INTO orders (user_id, address_id, payment_method, shipping_phone, shipping_name, status, grand_total, subtotal)
            VALUES ($1, $2, $3, $4, $5, 'Pending', 0, 0) 
            RETURNING order_id`;
        const orderRes = await client.query(orderQuery, [userId, address_id, paymentMethod, phone_number, name]);
        const orderId = orderRes.rows[0].order_id;

        for (const item of items) {
            // [CẬP NHẬT] Join thêm bảng products để lấy brand_id, category_id, product_id phục vụ check scope voucher
            const variantQuery = `
                SELECT 
                    COALESCE(pv.price, pv.best_price, pv.last_price, 0) as price, 
                    i.stock, i.reserved_stock,
                    p.id as product_id, p.category_id, p.brand_id
                FROM product_variants pv
                JOIN inventory i ON pv.variant_id = i.variant_id
                JOIN products p ON pv.product_id = p.id
                WHERE pv.variant_id = $1 
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

            const itemTotal = Number(productData.price) * item.quantity;
            calculatedGrandTotal += itemTotal;

            // Lưu lại thông tin item để tính promotion
            orderItemsInfo.push({
                ...item,
                price: Number(productData.price),
                total: itemTotal,
                product_id: productData.product_id,
                category_id: productData.category_id,
                brand_id: productData.brand_id
            });
        }

        // 2. Xử lý Promotion (Nếu có)
        let discountAmount = 0;
        if (promotion_id) {
            const voucher = await Promotion.findById(promotion_id); 
            
            if (!voucher) throw new Error("Voucher không tồn tại");
            if (!voucher.is_active) throw new Error("Voucher đã bị vô hiệu hóa");
            
            const now = new Date();
            if (new Date(voucher.start_date) > now) throw new Error("Voucher chưa đến đợt áp dụng");
            if (new Date(voucher.end_date) < now) throw new Error("Voucher đã hết hạn");
            if (voucher.used_count >= voucher.usage_limit) throw new Error("Voucher đã hết lượt sử dụng");

            // Check User Usage
            const isUsed = await Promotion.checkUserUsage(userId, promotion_id);
            if (isUsed) throw new Error("Bạn đã sử dụng voucher này rồi");

            // Check Min Order Amount (So sánh với Tổng tiền hàng)
            if (calculatedGrandTotal < Number(voucher.min_order_value)) { // Model Promotion đang dùng min_order_value
                 throw new Error(`Đơn hàng tối thiểu để áp dụng mã này là ${voucher.min_order_value}đ`);
            }

            // b. Check Scopes & Tính Eligible Amount
            const scopes = await Promotion.getScopes(promotion_id);
            let eligibleAmount = 0;

            if (scopes.length === 0) {
                // Áp dụng Global
                eligibleAmount = calculatedGrandTotal;
            } else {
                // Check từng item xem có khớp scope không
                for (const item of orderItemsInfo) {
                    let isMatch = false;
                    let brand = await Product.getBrandByProductId(item.brand_id);
                    let category = await Product.getCategoryByProductId(item.category_id);
                    //console.log('Checking item:', item, 'with brand:', brand, 'and category:', category, 'scopes:', scopes);
                    for (const scope of scopes) {
                        const targetId = Number(scope.target_id);
                        if (scope.target_type === 'category' && targetId === category.category_id) isMatch = true;
                        if (scope.target_type === 'brand' && targetId === brand.brand_id) isMatch = true;
                        if (scope.target_type === 'product' && targetId === item.product_id) isMatch = true;
                    }
                    if (isMatch) {
                        eligibleAmount += item.total;
                    }
                }
            }

            if (eligibleAmount === 0) {
                 throw new Error("Không có sản phẩm nào trong đơn hàng được áp dụng mã này");
            }
            
            // c. Tính Discount
            if (voucher.discount_type === 'percentage') {
                discountAmount = (eligibleAmount * Number(voucher.discount_value)) / 100;
                if (voucher.max_discount_amount) {
                    discountAmount = Math.min(discountAmount, Number(voucher.max_discount_amount));
                }
            } else if (voucher.discount_type === 'fixed') {
                discountAmount = Number(voucher.discount_value);
                // Đảm bảo không giảm quá giá trị đơn hàng (hoặc eligibleAmount)
                discountAmount = Math.min(discountAmount, eligibleAmount);
            }

            // d. Ghi nhận sử dụng (Truyền client transaction vào)
            await Promotion.recordUsage(client, userId, promotion_id, orderId, discountAmount);
        }
        console.log("voucher_id:", promotion_id, " discountAmount:", discountAmount);
        // 3. Cập nhật Đơn hàng với giá cuối cùng
        const finalGrandTotal = Math.max(0, calculatedGrandTotal - discountAmount);
        
        // Cần đảm bảo bảng orders có cột promotion_id và discount_amount. 
        // Nếu chưa có, bạn cần thêm cột vào DB: 
        // ALTER TABLE orders ADD COLUMN promotion_id INTEGER, ADD COLUMN discount_amount NUMERIC(15,2) DEFAULT 0;
        await client.query(
            `UPDATE orders 
             SET grand_total = $1, subtotal = $2, promotion_id = $3, discount_amount = $4 
             WHERE order_id = $5`, 
            [finalGrandTotal, calculatedGrandTotal, promotion_id || null, discountAmount, orderId]
        );

        await client.query('COMMIT');
        return { order_id: orderId, total: finalGrandTotal, discount: discountAmount };

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