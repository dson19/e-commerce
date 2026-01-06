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
  console.log("Sending OTP");
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mã xác thực đăng ký tài khoản',
    text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn trong 5 phút.`,
    html: `<h3>Mã OTP của bạn là: <b style="color:blue; font-size:20px;">${otp}</b></h3><p>Mã này sẽ hết hạn trong 5 phút.</p>`,
  };

  await transporter.sendMail(mailOptions);
};