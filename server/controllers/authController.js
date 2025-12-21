import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendOTP } from "../utils/emailService.js";
import redisClient from "../config/redis.js";

export const signUp = async (req, res) => {
    try {
        const { email, fullname, password, gender, phoneNumber } = req.body; 

        if (!email || !fullname || !password) {
            return res.status(400).json({message: "Vui lòng nhập đủ thông tin"});
        }

        // 1. check if email exists
        const emailduplicate = await User.findByEmail(email); 
        if (emailduplicate) {
            return res.status(409).json({message: "Email này đã được sử dụng"});
        }

        const phoneDuplicate = await User.findByPhone(phoneNumber);
        if (phoneDuplicate) {
            return res.status(409).json({message: "Số điện thoại này đã được sử dụng"});
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Tạo OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Gói dữ liệu đăng ký vào Object tạm
        const tempUserData = {
            email,
            fullname,
            password: hashedPassword,
            gender,
            phoneNumber,
            otpCode,
        };

        // 5. LƯU TOÀN BỘ VÀO REDIS (Thay vì chỉ lưu mỗi OTP)
        // Key: temp_registration:email
        // Hết hạn: 5 phút (300s)
        await redisClient.setEx(
            `temp_register:${email}`, 
            300, 
            JSON.stringify(tempUserData) // Phải chuyển thành chuỗi JSON
        );

        // 6. Gửi mail
        await sendOTP(email, otpCode);

        res.status(200).json({message: "OTP sent. Please verify to complete registration.", email: email});

    } catch (error) {
        console.error("Error during sign up:", error);
        res.status(500).json({message: "Server error"});
    }
}

// Lấy dữ liệu từ Redis, so sánh OTP, nếu đúng thì lưu vào PostgreSQL
export const verifyAccount = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Lấy dữ liệu tạm từ Redis
        const dataString = await redisClient.get(`temp_register:${email}`);

        if (!dataString) {
            return res.status(400).json({message: "Mã OTP đã hết hạn hoặc bạn chưa đăng ký"});
        }

        // Parse chuỗi JSON thành Object
        const tempData = JSON.parse(dataString);

        // 2. So sánh OTP
        if (tempData.otpCode !== otp) {
            return res.status(400).json({message: "Mã OTP không chính xác"});
        }

        // 3. OTP Đúng THÌ LƯU VÀO POSTGRESQL
        const newUser = await User.create(
            tempData.email, 
            tempData.fullname,
            tempData.password, 
            tempData.gender, 
            tempData.phoneNumber
        );

        // Xóa dữ liệu tạm trong Redis
        await redisClient.del(`temp_register:${email}`);

        // Nếu thành công (Status 201)
        res.status(201).json({message: "Tài khoản đã được xác thực và tạo thành công"});

    } catch (error) {
        console.error("Error verify:", error);
        res.status(500).json({message: "Server error during verification"});
    }
}
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check null fields
        if (!email || !password) {
            return res.status(400).json({ message: "Điền thông tin còn thiếu" });
        }

        let user;
        // Find user by email or phone
        if (!email.includes('@')) {
            // phone login
            user = await User.findByPhone(email);
        } else {
            // email login
            user =  await User.findByEmail(email);
        } 

        if (!user) {
            return  res.status(401).json({ message: "Thông tin không hợp lệ" });
        }
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Thông tin không hợp lệ" });
        }
        //generate token
        const token = generateToken(user.user_id);
        // Set token in HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,  // Quan trọng: Chống XSS
            secure: false,   // localhost để false
            sameSite: "lax", // fe và be khác domain 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });
        res.status(200).json({
            message: "Đăng nhập thành công",
            user: {
                id: user.user_id,
                email: user.email,
                fullname: user.fullname,
                phone_number: user.phone_number,
            }
        });
        }
    catch (error) {
        console.error("Error during sign in:", error);
        res.status(500).json({ message: "Server error" });
    }
}
export const signOut = async (req, res) => {
        res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: false
    });
    res.status(200).json({ message: "Đăng xuất thành công" });
}
export const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByIdNoPassword(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            user: { 
                id: user.user_id,
                email: user.email,
                fullname: user.fullname,
                phone_number: user.phone_number,
                gender: user.gender,
                // Thêm các trường khác nếu cần
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Server error" });
    }
}



// Gửi OTP quên mật khẩu
export const sendForgotPasswordOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

        // Kiểm tra email có tồn tại trong DB không
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Email này chưa được đăng ký" });
        }

        // Tạo OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu OTP vào Redis (Hết hạn 5 phút)
        // Key: forgot_pass:email
        await redisClient.setEx(`forgot_pass:${email}`, 300, otpCode);

        // Gửi mail
        await sendOTP(email, otpCode);

        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Xác nhận OTP
export const verifyForgotOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = await redisClient.get(`forgot_pass:${email}`);

        if (!storedOtp) return res.status(400).json({ message: "OTP hết hạn hoặc không tồn tại" });
        if (storedOtp !== otp) return res.status(400).json({ message: "Mã OTP không chính xác" });

        res.status(200).json({ message: "OTP hợp lệ" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// 3. Đặt lại mật khẩu mới

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        //  Kiểm tra OTP trong Redis trước
        const storedOtp = await redisClient.get(`forgot_pass:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ message: "Phiên xác thực hết hạn hoặc không hợp lệ" });
        }

        //  Lấy thông tin user để kiểm tra mật khẩu cũ
        // Hàm findByEmail trả về user có chứa trường password (hash)
        const user = await User.findByEmail(email);
        if (!user) {
             return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
        }

        //  SO SÁNH MẬT KHẨU MỚI VÀ CŨ
        // bcrypt.compare trả về true nếu mật khẩu khớp (tức là trùng nhau)
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        
        if (isSamePassword) {
            return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ" });
        }

        // Hash mật khẩu mới (nếu không trùng)
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật vào Database
        await User.updatePassword(email, hashedPassword);

        // Xóa OTP sau khi đổi thành công để tránh dùng lại
        await redisClient.del(`forgot_pass:${email}`);

        res.status(200).json({ message: "Đổi mật khẩu thành công" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { fullname } = req.body;

        const updatedUser = await User.updateProfile(userId, fullname);
        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.status(200).json({
            message: "Cập nhật hồ sơ thành công",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật hồ sơ" });
    }
};