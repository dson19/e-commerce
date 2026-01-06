import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // Khai báo server Gmail trực tiếp
  port: 587,               // Cổng 587 (STARTTLS) ổn định nhất trên Render
  secure: false,           // false đối với port 587 (nếu dùng port 465 mới để true)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Đây phải là Mật khẩu ứng dụng 16 ký tự
  },
  // Thêm options để debug lỗi kết nối tốt hơn
  tls: {
    ciphers: 'SSLv3'
  },
  connectionTimeout: 10000, // Timeout sau 10 giây nếu không kết nối được
});

export const sendOTP = async (email, otp) => {
  try {
    console.log("⏳ Bắt đầu gửi OTP đến:", email);
    
    // Kiểm tra biến môi trường
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("❌ Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS");
    }

    const mailOptions = {
      from: `"Mobile Store" <${process.env.EMAIL_USER}>`, 
      to: email,
      subject: 'Mã xác thực đăng ký tài khoản',
      text: `Mã OTP của bạn là: ${otp}`,
      html: `<h3>Mã OTP của bạn là: <b style="color:blue; font-size:20px;">${otp}</b></h3>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Gửi mail thành công:", info.response);
    
  } catch (error) {
    console.error("❌ Lỗi gửi mail chi tiết:", error);
    // Log thêm thông tin nếu có lỗi kết nối
    if (error.code === 'ETIMEDOUT') {
        console.error("⚠️ Lỗi này thường do Port bị chặn hoặc mạng chậm. Hãy kiểm tra lại Port 587.");
    }
  }
};