import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/services/api";
import { cn } from "@/lib/utils"; // Import cn utility

// Tận dụng lại style UI 2 cột giống trang SigninForm
const ResetPassword = ({ className, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Lấy dữ liệu được truyền từ trang Login
  const { email, otp } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false); // Nếu người dùng truy cập trực tiếp vào link mà không có email/otp -> đá về login

  useEffect(() => {
    if (!email || !otp) {
      navigate("/signIn");
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
      await authService.resetPassword({
        email,
        otp,
        newPassword: password,
      });
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate("/signIn");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; // Không render nếu thiếu email

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card
        className={cn("w-full max-w-4xl p-0 overflow-hidden", className)}
        {...props}
      >
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Cột 1: Form Đặt lại Mật khẩu */}
          <form className="p-6 md:p-8" onSubmit={handleReset}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
                <p className="text-sm text-gray-500">
                  Vui lòng tạo mật khẩu mới cho tài khoản: <b>{email}</b>
                </p>
              </div>
              {/* Input Mật khẩu mới */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
              {/* Input Xác nhận Mật khẩu */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
              </Button>
              <div className="text-sm text-center">
                Đã có mật khẩu?
                <a
                  onClick={() => navigate("/signIn")}
                  className="hover:underline cursor-pointer"
                >
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>
          {/* Cột 2: Hình ảnh trang trí (Giống như SigninForm) */}
          <div className="relative hidden md:block">
            {/* Bạn có thể dùng lại ảnh placeholderSignIn.png hoặc đổi thành ảnh khác phù hợp với việc Reset */}
            <img
              src="/placeholderForgotPassword.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
