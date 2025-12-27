import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//đọc file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: "http://localhost:5173", // Chỉ định chính xác link Frontend
  credentials: true // Cho phép mang theo Cookie/Token
}));
app.use(express.json());
app.use(cookieParser());
//public route
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);

app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});


