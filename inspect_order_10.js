import pool from './server/config/db.js';

const inspectOrder10 = async () => {
    try {
        console.log('--- Order 10 Info ---');
        const orderRes = await pool.query('SELECT * FROM orders WHERE order_id = 10');
        console.log(JSON.stringify(orderRes.rows[0], null, 2));

        console.log('\n--- Order 10 Items ---');
        const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = 10');
        console.log(JSON.stringify(itemsRes.rows, null, 2));

        if (itemsRes.rows.length > 0) {
            const variantId = itemsRes.rows[0].variant_id;
            console.log('\n--- Variant Info for Item 1 ---');
            const variantRes = await pool.query('SELECT * FROM product_variants WHERE variant_id = $1', [variantId]);
            console.log(JSON.stringify(variantRes.rows[0], null, 2));

            console.log('\n--- Inventory Info for Item 1 ---');
            const invRes = await pool.query('SELECT * FROM inventory WHERE variant_id = $1', [variantId]);
            console.log(JSON.stringify(invRes.rows[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

inspectOrder10();
