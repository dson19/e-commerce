import { createClient } from 'redis';
import dotenv from 'dotenv';

// Đọc biến môi trường
dotenv.config();

// Tạo client với đường dẫn từ .env
const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('❌ Redis Client Error', err));
client.on('connect', () => console.log('✅ Đã kết nối Redis Online (Upstash)!'));

// Kết nối
await client.connect();

export default client;