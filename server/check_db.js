import pool from '../config/db.js';

const checkColumns = async () => {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'addresses'");
        console.log('Columns in addresses table:', res.rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error checking columns:', err);
    }
};

checkColumns();
