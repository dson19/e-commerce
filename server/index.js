import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes.js';
import adminRoute from './routes/adminRoutes.js';
import orderRoute from './routes/orderRoute.js';
import paymentRoute from './routes/paymentRoute.js';

//đọc file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;
app.use(cors({
  origin: ["http://localhost:5173", "https://e-commerce-two-rho-64.vercel.app"],
  credentials: true // Cho phép mang theo Cookie/Token
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoute);
app.use('/api/orders', orderRoute);
app.use('/api/payment', paymentRoute);
// Error Handler Middleware
import { errorHandler } from './middleware/errorMiddleware.js';
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});