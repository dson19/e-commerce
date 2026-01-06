import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTP = async (email, otp) => {
  try {
    
    // Kiểm tra biến môi trường
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error("❌ Thiếu cấu hình SENDGRID_API_KEY");
    }

    if (!process.env.EMAIL_USER) {
        throw new Error("❌ Thiếu cấu hình EMAIL_USER (Email đã verify Single Sender)");
    }

    const msg = {
      to: email, // Người nhận
      from: {
        name: "e-commerce",
        email: process.env.EMAIL_USER 
      },
      subject: 'Mã xác thực đăng ký tài khoản',
      text: `Mã OTP của bạn là: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Xác thực tài khoản</h2>
          <p>Mã OTP của bạn là:</p>
          <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
          <p>Mã này sẽ hết hạn trong 5 phút.</p>
          <hr/>
          <p style="font-size: 12px; color: #666;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log("✅ SendGrid: Đã gửi mail thành công");
    
  } catch (error) {
    console.error("❌ Lỗi gửi mail SendGrid:", error);
    
    if (error.response) {
      // In lỗi chi tiết từ SendGrid (rất quan trọng để debug)
      console.error("Chi tiết lỗi:", error.response.body);
    }
  }
};