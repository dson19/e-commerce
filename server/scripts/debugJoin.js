import pool from '../config/db.js';

const debugJoin = async () => {
    try {
        console.log("Running JOIN query...");
        const query = `
            SELECT c.quantity, p.id, p.name, p.price, p.img, p.category, p.discount, p.old_price as "oldPrice"
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
        `;
        const res = await pool.query(query);
        console.log("JOIN Success. Rows:", res.rows.length);

    } catch (error) {
        console.error("JOIN Failed:", error);
    } finally {
        pool.end();
    }
};

debugJoin();
