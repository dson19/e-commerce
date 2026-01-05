import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Try without SSL for local/standard connections
});

const listCols = async () => {
    try {
        const tables = ['orders', 'order_items', 'product_variants', 'inventory'];
        for (const table of tables) {
            console.log(`\n--- Columns for ${table} ---`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            console.table(res.rows);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

listCols();
