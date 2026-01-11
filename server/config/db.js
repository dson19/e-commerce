// db.js
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

// Kích hoạt đọc file .env
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(' Đã kết nối database');
  }
});

pool.on('error', (err) => {
  console.error(' Database connection error:', err);
});

export default pool;