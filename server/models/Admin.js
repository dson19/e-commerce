import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getStats = async (req, res) => {
    const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
    const orderCountRes = await pool.query('SELECT COUNT(*) FROM orders');
    const revenueRes = await pool.query('SELECT COALESCE(SUM(grand_total), 0) AS revenue FROM orders WHERE status = $1', ['paid']);
    return {
        totalUsers: parseInt(userCountRes.rows[0].count),
        totalOrders: parseInt(orderCountRes.rows[0].count),
        totalRevenue: parseInt(revenueRes.rows[0].revenue),
    }
};