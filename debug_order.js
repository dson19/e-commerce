import pool from './server/config/db.js';

const debugLastOrder = async () => {
    try {
        const orderRes = await pool.query(`
            SELECT * FROM orders ORDER BY created_at DESC LIMIT 1
        `);
        if (orderRes.rows.length === 0) {
            console.log('No orders found');
            process.exit(0);
        }
        const order = orderRes.rows[0];
        console.log('Last Order:', JSON.stringify(order, null, 2));

        const itemsRes = await pool.query(`
            SELECT * FROM order_items WHERE order_id = $1
        `, [order.order_id]);
        console.log('Order Items:', JSON.stringify(itemsRes.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error debugging order:', err);
        process.exit(1);
    }
};

debugLastOrder();
