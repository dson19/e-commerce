import pool from './config/db.js';

const inspect = async () => {
    try {
        console.log("\n=== Product Variants (Sample) ===");
        const res = await pool.query(`
            SELECT p.name, pv.variant_id, pv.color, pv.price, pv.image_url 
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.id
            WHERE p.name ILIKE '%iPhone%'
            LIMIT 10
        `);
        console.table(res.rows);

        console.log("\n=== Cart Items (Sample) ===");
        const cartRes = await pool.query(`
            SELECT ci.*, p.name, pv.price 
            FROM cart_items ci
            JOIN product_variants pv ON ci.variant_id = pv.variant_id
            JOIN products p ON pv.product_id = p.id
            LIMIT 5
        `);
        console.table(cartRes.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspect();
