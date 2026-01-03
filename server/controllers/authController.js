import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendOTP } from "../utils/emailService.js";
import redisClient from "../config/redisClient.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ErrorResponse } from "../middleware/errorMiddleware.js";

export const signUp = asyncHandler(async (req, res) => {
    const { email, fullname, password, gender, phoneNumber } = req.body; 

    if (!email || !fullname || !password) {
        throw new ErrorResponse("Vui lòng nhập đủ thông tin", 400);
    }

    const emailduplicate = await User.findByEmail(email); 
    if (emailduplicate) {
        throw new ErrorResponse("Email này đã được sử dụng", 409);
    }

    const phoneDuplicate = await User.findByPhone(phoneNumber);
    if (phoneDuplicate) {
        throw new ErrorResponse("Số điện thoại này đã được sử dụng", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const tempUserData = {
        email,
        fullname,
        password: hashedPassword,
        gender,
        phoneNumber,
        otpCode,
    };

    await redisClient.setEx(
        `temp_register:${email}`, 
        300, 
        JSON.stringify(tempUserData)
    );

    await sendOTP(email, otpCode);

    res.status(200).json({
        success: true,
        message: "OTP sent. Please verify to complete registration.", 
        data: { email: email }
    });
});

export const verifyAccount = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const dataString = await redisClient.get(`temp_register:${email}`);

    if (!dataString) {
        throw new ErrorResponse("Mã OTP đã hết hạn hoặc bạn chưa đăng ký", 400);
    }

    const tempData = JSON.parse(dataString);

    if (tempData.otpCode !== otp) {
        throw new ErrorResponse("Mã OTP không chính xác", 400);
    }

    const newUser = await User.create(
        tempData.email, 
        tempData.fullname,
        tempData.password, 
        tempData.gender, 
        tempData.phoneNumber
    );

    await redisClient.del(`temp_register:${email}`);

    res.status(201).json({
        success: true,
        message: "Tài khoản đã được xác thực và tạo thành công"
    });
});

export const signIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ErrorResponse("Điền thông tin còn thiếu", 400);
    }

    let user;
    if (!email.includes('@')) {
        user = await User.findByPhone(email);
    } else {
        user =  await User.findByEmail(email);
    } 

    if (!user) {
        throw new ErrorResponse("Thông tin không hợp lệ", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ErrorResponse("Thông tin không hợp lệ", 401);
    }

    const token = generateToken(user.user_id, user.role);
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
            id: user.user_id,
            email: user.email,
            fullname: user.fullname,
            phone_number: user.phone_number,
            gender: user.gender,
            role: user.role
        }
    });
});

export const signOut = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });
    res.status(200).json({
        success: true,
        message: "Đăng xuất thành công"
    });
});

export const getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findByIdNoPassword(userId);
    if (!user) {
        throw new ErrorResponse("User not found", 404);
    }
    res.status(200).json({
        success: true,
        data: { 
            id: user.user_id,
            email: user.email,
            fullname: user.fullname,
            phone_number: user.phone_number,
            gender: user.gender,
            role: user.role
        }
    });
});

export const sendForgotPasswordOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ErrorResponse("Vui lòng nhập email", 400);

    const user = await User.findByEmail(email);
    if (!user) {
        throw new ErrorResponse("Email này chưa được đăng ký", 404);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`forgot_pass:${email}`, 300, otpCode);
    await sendOTP(email, otpCode);

    res.status(200).json({
        success: true,
        message: "Mã OTP đã được gửi đến email của bạn"
    });
});

export const verifyForgotOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = await redisClient.get(`forgot_pass:${email}`);

    if (!storedOtp) throw new ErrorResponse("OTP hết hạn hoặc không tồn tại", 400);
    if (storedOtp !== otp) throw new ErrorResponse("Mã OTP không chính xác", 400);

    res.status(200).json({
        success: true,
        message: "OTP hợp lệ"
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const storedOtp = await redisClient.get(`forgot_pass:${email}`);
    if (!storedOtp || storedOtp !== otp) {
        throw new ErrorResponse("Phiên xác thực hết hạn hoặc không hợp lệ", 400);
    }

    const user = await User.findByEmail(email);
    if (!user) {
        throw new ErrorResponse("Email không tồn tại trong hệ thống", 404);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
    if (isSamePassword) {
        throw new ErrorResponse("Mật khẩu mới không được trùng với mật khẩu cũ", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(email, hashedPassword);
    await redisClient.del(`forgot_pass:${email}`);

    res.status(200).json({
        success: true,
        message: "Đổi mật khẩu thành công"
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { fullname } = req.body;

    const updatedUserNoPassword = await User.findByIdNoPassword(userId);
    if (!updatedUserNoPassword) {
        throw new ErrorResponse("Không tìm thấy người dùng", 404);
    }
    res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công",
        data: updatedUserNoPassword
    });
});