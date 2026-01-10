import asyncHandler from 'express-async-handler';
import pool from '../config/db.js';
import { getStats } from '../models/Admin.js';
import Order from '../models/Order.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
    const data = await getStats();
    console.log("Backend Stats Data:", JSON.stringify(data, null, 2));
    res.json({
        success: true,
        data: data
    });
});

export const getOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, sortBy, sortOrder } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const result = await Order.getAllOrders({
        limit: limitNum,
        offset,
        search,
        status,
        sortBy,
        sortOrder
    });

    res.json({
        success: true,
        data: result.orders,
        pagination: {
            total: result.total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(result.total / limitNum)
        }
    });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        res.status(400);
        throw new Error('Status is required');
    }

    // Determine if we should use special logic (like cancelOrder)
    // For now, simpler management: just update status via Order.updateStatus
    // If status is 'Cancelled' and we want to restock, we should probably call Order.cancelOrder instead or within updateStatus.
    // However, the admin might just want to flag it as cancelled without restock logic if it was a mistake or whatever.
    // But usually 'Cancelled' implies restocking.
    // Let's stick to simple update for now unless it is 'Cancelled'

    let updatedOrder;
    if (status.toLowerCase() === 'cancelled') {
        // Use the cancel logic
        await Order.cancelOrder(orderId);
        updatedOrder = { order_id: orderId, status: 'Cancelled' }; // partial mock since cancelOrder returns void/boolean
    } else {
        updatedOrder = await Order.updateStatus(orderId, status);
    }

    res.json({
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder
    });
});

export const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.getOrderByIdNoUserId(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Đơn hàng không tồn tại');
    }

    res.json({
        success: true,
        data: order
    });
});

export const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // 1. Get total count
    const countRes = await pool.query('SELECT COUNT(*) FROM users');
    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limitNum);

    // 2. Get paginated users
    const query = `
        SELECT user_id, email, fullname, phone_number, gender, role, created_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limitNum, offset]);

    res.json({
        success: true,
        data: result.rows,
        pagination: {
            total: totalItems,
            page: pageNum,
            limit: limitNum,
            totalPages: totalPages
        }
    });
});

export const updateInventory = asyncHandler(async (req, res) => {
    const { variantId } = req.params;
    const { stock, reserved_stock } = req.body;

    if (stock === undefined) {
        throw new ErrorResponse("Số lượng tồn kho là bắt buộc", 400);
    }

    // Upsert logic for inventory
    const query = `
        INSERT INTO inventory (variant_id, stock, reserved_stock)
        VALUES ($1, $2, $3)
        ON CONFLICT (variant_id)
        DO UPDATE SET 
            stock = EXCLUDED.stock,
            reserved_stock = COALESCE(EXCLUDED.reserved_stock, inventory.reserved_stock),
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `;

    const result = await pool.query(query, [variantId, stock, reserved_stock || 0]);

    res.json({
        success: true,
        message: "Cập nhật kho hàng thành công",
        data: result.rows[0]
    });
});

export default { getDashboardStats, getUsers, updateInventory, getOrders, updateOrderStatus, getOrderDetails };