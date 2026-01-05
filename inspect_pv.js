import pool from './server/config/db.js';

const inspectTable = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'product_variants'
        `);
        console.log('Columns in product_variants table:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error inspecting table:', err);
        process.exit(1);
    }
};

inspectTable();
