import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const signUp = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        // Check duplicate
        const duplicate = await User.findByEmail(email); 
        if (duplicate) {
            return res.status(409).json({message: "User with this email already exists"});
        }

        // Hash password (giữ nguyên)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user
        await User.create(email, hashedPassword);
        
        res.status(201).json({message: "User registered successfully"});

    } catch (error) {
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
