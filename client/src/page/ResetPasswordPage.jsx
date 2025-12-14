import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import axios from 'axios';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy dữ liệu được truyền từ trang Login
  const { email, otp } = location.state || {}; 

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu người dùng truy cập trực tiếp vào link mà không có email/otp -> đá về login
  useEffect(() => {
    if (!email || !otp) {
      navigate('/signIn');
    }
  }, [email, otp, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 8) {
      toast.error("Mật khẩu phải từ 8 ký tự trở lên");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        otp,
        newPassword: password
      });
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate('/signIn');
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h2>
        <p className="text-center text-gray-500 mb-4 text-sm">Cho tài khoản: {email}</p>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label>Mật khẩu mới</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="******" 
            />
          </div>
          <div>
            <Label>Xác nhận mật khẩu</Label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="******" 
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;