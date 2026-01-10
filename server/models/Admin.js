import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getStats = async () => {
    const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
    const orderCountRes = await pool.query('SELECT COUNT(*) FROM orders');

    // Count revenue for all non-cancelled orders
    const revenueRes = await pool.query("SELECT COALESCE(SUM(grand_total), 0) AS revenue FROM orders WHERE LOWER(status) != 'cancelled'");
    const todayRevenueRes = await pool.query("SELECT COALESCE(SUM(grand_total), 0) AS revenue FROM orders WHERE LOWER(status) != 'cancelled' AND order_date::DATE = CURRENT_DATE");

    // Query for last 7 days revenue (non-cancelled)
    const chartQuery = `
        SELECT 
            TO_CHAR(d, 'DD/MM') as display_date, 
            COALESCE(SUM(o.grand_total), 0) as revenue
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d(date)
        LEFT JOIN orders o ON o.order_date::DATE = d.date AND LOWER(o.status) != 'cancelled'
        GROUP BY d.date
        ORDER BY d.date;
    `;

    try {
        const chartRes = await pool.query(chartQuery);
        console.log("Chart Rules Rows:", chartRes.rows);

        return {
            totalUsers: parseInt(userCountRes.rows[0].count),
            totalOrders: parseInt(orderCountRes.rows[0].count),
            totalRevenue: parseInt(revenueRes.rows[0].revenue),
            todayRevenue: parseInt(todayRevenueRes.rows[0].revenue),
            revenueChart: chartRes.rows || []
        };
    } catch (err) {
        console.error("Stats Query Error:", err);
        return {
            totalUsers: parseInt(userCountRes.rows[0].count),
            totalOrders: parseInt(orderCountRes.rows[0].count),
            totalRevenue: parseInt(revenueRes.rows[0].revenue),
            todayRevenue: parseInt(todayRevenueRes.rows[0].revenue),
            revenueChart: []
        };
    }
};