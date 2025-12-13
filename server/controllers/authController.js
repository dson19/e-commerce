import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendOTP } from "../utils/emailService.js";
import redisClient from "../config/redis.js";

export const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, gender, phoneNumber } = req.body; 

        if (!email || !password) {
            return res.status(400).json({message: "Vui lòng nhập đủ thông tin"});
        }

        // 1. check if email exists
        const emailduplicate = await User.findByEmail(email); 
        if (emailduplicate) {
            return res.status(409).json({message: "Email này đã được sử dụng"});
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Tạo OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Gói dữ liệu đăng ký vào Object tạm
        const tempUserData = {
            firstName,
            lastName,
            email,
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

        // 3. OTP Đúng -> BẮT ĐẦU LƯU VÀO POSTGRESQL
        // Lúc này mới gọi hàm create của Model
        // Lưu ý: Hàm User.create của bạn cần trả về user mới tạo
        const newUser = await User.create(
            tempData.firstName, 
            tempData.lastName, 
            tempData.email, 
            tempData.password, 
            tempData.gender, 
            tempData.phoneNumber
        );

        // (Tùy chọn) Cập nhật luôn trạng thái verified nếu model có cột này
        // Hoặc mặc định hàm create nên set is_verified = true luôn

        // 4. Xóa dữ liệu tạm trong Redis
        await redisClient.del(`temp_register:${email}`);

        res.status(200).json({message: "Đăng ký thành công! Bạn có thể đăng nhập."});

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
            return res.status(400).json({ message: "All fields are required" });
        }
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        //generate token
        const token = generateToken(user.id);
        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
        }
    catch (error) {
        console.error("Error during sign in:", error);
        res.status(500).json({ message: "Server error" });
    }
}
