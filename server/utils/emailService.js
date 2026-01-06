import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn (thêm vào .env)
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (thêm vào .env)
  },
});

export const sendOTP = async (email, otp) => {
  try {
    console.log("⏳ Bắt đầu gửi OTP đến:", email);
    
    // Kiểm tra xem biến môi trường có nhận không
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("❌ Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS");
    }

    const mailOptions = {
      from: `"Mobile Store" <${process.env.EMAIL_USER}>`, // Thêm tên hiển thị cho chuyên nghiệp
      to: email,
      subject: 'Mã xác thực đăng ký tài khoản',
      text: `Mã OTP của bạn là: ${otp}`,
      html: `<h3>Mã OTP của bạn là: <b style="color:blue; font-size:20px;">${otp}</b></h3>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Gửi mail thành công:", info.response);
    
  } catch (error) {
    console.error("❌ Lỗi gửi mail:", error); // Quan trọng: Log lỗi chi tiết
  }
};