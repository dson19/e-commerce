import pool from '../config/db.js';

const resetProducts = async () => {
    try {
        await pool.query('DROP TABLE IF EXISTS products CASCADE');
        console.log("Dropped products table.");
    } catch (error) {
        console.error("Error dropping table:", error);
    } finally {
        pool.end();
    }
};

resetProducts();
