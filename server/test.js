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
async function testRedisConnection() {
  try {
    const redisClient = (await import('./config/redis.js')).default;
    await redisClient.ping();
    console.log("✅ KẾT NỐI REDIS THÀNH CÔNG!");
  } catch (err) {
    console.error("❌ Lỗi kết nối Redis:", err.message);
  }
}

testRedisConnection();
