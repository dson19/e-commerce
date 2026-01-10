
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import pool from './config/db.js';

const debugStats = async () => {
    try {
        console.log("Testing DB Connection...");
        const client = await pool.connect();
        console.log("DB Connected successfully.");
        client.release();

        console.log("Running Recent Orders Query...");
        const recentOrdersQuery = `
            SELECT o.order_id, u.fullname, o.grand_total, o.status, o.order_date 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.user_id 
            ORDER BY o.order_date DESC 
            LIMIT 5
        `;
        const res = await pool.query(recentOrdersQuery);
        console.log("Result Row Count:", res.rowCount);
        console.log("Rows:", JSON.stringify(res.rows, null, 2));

        console.log("Checking total orders count...");
        const countRes = await pool.query('SELECT COUNT(*) FROM orders');
        console.log("Total Orders:", countRes.rows[0].count);

    } catch (error) {
        console.error("Debug Error:", error);
    } finally {
        await pool.end();
    }
};

debugStats();
