import pool from './config/db.js';

const inspect = async () => {
    try {
        const tables = ['orders', 'order_items', 'product_variants', 'inventory', 'addresses'];
        for (const table of tables) {
            console.log(`\n--- Columns for ${table} ---`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            console.log(`Columns for ${table}:`, JSON.stringify(res.rows, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

inspect();
