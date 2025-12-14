import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Kích hoạt đọc file .env để lấy JWT_SECRET
dotenv.config();

export const generateToken = (userId) => {

  const payload = {
    userId: userId
  };

  // 2. Ký Token (Sign)
  // - Tham số 1: Payload
  // - Tham số 2: Secret Key (lấy từ .env)
  // - Tham số 3: Cấu hình (Hết hạn sau 7 ngày)
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d" 
  });

  return token;
};

