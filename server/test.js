// test.js
import pool from './config/db.js'; // <-- Lưu ý: Phải có đuôi .js

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("✅ KẾT NỐI THÀNH CÔNG! Giờ hiện tại ở DB là:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Lỗi kết nối:", err.message);
  }
}

testConnection();