import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
export const signUp = async (req, res) => {
    try {
        const {username,email, password} = req.body;
        // Check null fields
        if (!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        // Check if user already exists
        const duplicate = await User.findByEmail({email});
        if (duplicate) {
            return res.status(409).json({message: "User with this email already exists"});
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create new user
        await User.create(email, username, hashedPassword);
        res.status(204).json({message: "User registered successfully"});
        // Return success response

    }
    catch (error) {
        console.error("Error during sign up:", error);
        res.status(500).json({message: "Server error"});
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
                id: user.id,
                username: user.username,
                email: user.email
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
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Server error" });
    }
}