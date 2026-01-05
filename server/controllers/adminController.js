import asyncHandler from 'express-async-handler';
import pool from '../config/db.js';
import { getStats } from '../models/Admin.js';
export const getDashboardStats = asyncHandler(async (req, res) => {
    const data = await getStats(req, res);
    res.json({
        success: true,
        data: data
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

export default { getDashboardStats, getUsers, updateInventory };