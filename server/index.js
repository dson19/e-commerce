import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';

//đọc file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
//public route
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});


