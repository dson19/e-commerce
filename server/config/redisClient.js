import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const isProduction = redisUrl?.startsWith('rediss://');

const redisClient = createClient({
    url: redisUrl,
    socket: isProduction ? {
        tls: true,
        rejectUnauthorized: false
    } : undefined
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Đã kết nối Redis Online (Upstash)!'));

await redisClient.connect();

export default redisClient;