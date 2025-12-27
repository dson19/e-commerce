import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
    // THÊM ĐOẠN NÀY ĐỂ KẾT NỐI ỔN ĐỊNH HƠN VỚI UPSTASH
    socket: {
        tls: true,
        rejectUnauthorized: false
    }
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Đã kết nối Redis Online (Upstash)!'));

await redisClient.connect();

export default redisClient;