import pool from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';

// Specify path to .env file relative to current working directory (project root)
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const listCategories = async () => {
    // Dynamic import to ensure env is loaded first
    // Re-create pool here to avoid export issues or env timing in other file
    const { Pool } = await import('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        const res = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
        console.table(res.rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listCategories();
