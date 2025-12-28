import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const testDb = async () => {
    try {
        console.log("Testing connection...");
        const res = await pool.query('SELECT NOW()');
        console.log("Connection successful:", res.rows[0]);
        
        console.log("Attempting to create test table...");
        await pool.query('CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY)');
        console.log("Test table created.");
        
        console.log("Dropping test table...");
        await pool.query('DROP TABLE test_table');
        console.log("Test table dropped.");
        
        process.exit(0);
    } catch (err) {
        console.error("DB Error:", err);
        process.exit(1);
    }
};

testDb();
