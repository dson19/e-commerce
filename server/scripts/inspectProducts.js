import pool from '../config/db.js';

const inspectProducts = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products'
        `);
        console.log("Products Columns:", res.rows);
    } catch (error) {
        console.error("Error inspecting products:", error);
    } finally {
        pool.end();
    }
};

inspectProducts();
