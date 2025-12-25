import pool from '../config/db.js';

const checkTables = async () => {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables in DB:", res.rows.map(r => r.table_name));

        const cartColumns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'cart_items'
        `);
        console.log("Cart Items Columns:", cartColumns.rows);

        const userColumns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log("Users Columns:", userColumns.rows);
        
    } catch (error) {
        console.error("Error checking tables:", error);
    } finally {
        pool.end();
    }
};

checkTables();
