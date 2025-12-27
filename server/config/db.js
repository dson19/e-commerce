// db.js
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

// Kích hoạt đọc file .env
dotenv.config();

// --- THÊM DÒNG NÀY ĐỂ TEST ---
console.log("Kiểm tra link:", process.env.DATABASE_URL);
// -----------------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false }
});

export default pool;