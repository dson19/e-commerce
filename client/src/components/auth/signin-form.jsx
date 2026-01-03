import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext-temp";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const signinSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email hoặc username"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export function SigninForm({ className, ...props }) {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const { signIn } = useAuth();

  // State cho Forgot Password
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showForgotOtp, setShowForgotOtp] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isLoadingForgot, setIsLoadingForgot] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setApiError("");
    try {
      const response = await authService.signIn({
        email: data.email,
        password: data.password,
      });
      const user = response.data.data;
      signIn(user);
      
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || "Đăng nhập thất bại.";
      setApiError(msg);
    }
  };

  const handleSendForgotOtp = async () => {
    if (!forgotEmail) return toast.error("Vui lòng nhập email");
    setIsLoadingForgot(true);
    try {
      await authService.sendForgotOTP(forgotEmail);
      setIsForgotPasswordOpen(false);
      setShowForgotOtp(true);
      toast.success("Mã OTP đã được gửi! Vui lòng kiểm tra email.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi OTP thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoadingForgot(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    if (otpValue.length < 6) return alert("Vui lòng nhập đủ 6 số OTP");
    try {
      await authService.verifyForgotOTP({
        email: forgotEmail,
        otp: otpValue,
      });
      setShowForgotOtp(false);
      navigate("/reset-password", { state: { email: forgotEmail, otp: otpValue } });
      toast.success("Xác thực OTP thành công! Vui lòng đặt lại mật khẩu.");
    } catch {
      toast.error("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="text-2xl font-bold">Chào mừng quay lại</h1>
                <p className="text-sm text-gray-500">Nhập thông tin để đăng nhập</p>
              </div>

              {/* INPUT EMAIL / USERNAME */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">Email hoặc Số điện thoại </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder=""
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="text-sm hover:underline">
                    Quên mật khẩu?
                  </button>
                </div>
                <Input id="password" type="password" placeholder="••••••" {...register("password")} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {apiError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                  {apiError}
                </div>
              )}

              <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>

              <div className="text-sm text-center">
                Chưa có tài khoản?{" "}
                {/* Sửa href thành to, thêm dấu /, và đổi về chữ thường nếu route của bạn là chữ thường */}
                <Link to="/signUp" className="hover:underline cursor-pointer">
                  Đăng ký
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden md:block bg-gray-100">
            {/* Đảm bảo ảnh tồn tại trong thư mục public */}
            <img src="/placeholderSignIn.png" alt="Image" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </CardContent>
      </Card>

      {/* --- THỦ CÔNG MODAL 1: NHẬP EMAIL --- */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-2">Quên mật khẩu?</h3>
            <p className="text-sm text-gray-500 mb-4">Nhập email để nhận mã xác thực.</p>

            <Label className="mb-2 block">Email của bạn</Label>
            <Input
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="name@example.com"
              className="mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>Hủy</Button>
              <Button onClick={handleSendForgotOtp} disabled={isLoadingForgot}>
                {isLoadingForgot ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- THỦ CÔNG MODAL 2: NHẬP OTP --- */}
      {showForgotOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg animate-in fade-in zoom-in duration-200 text-center">
            <h3 className="text-lg font-bold mb-2">Xác thực OTP</h3>
            <p className="text-sm text-gray-500 mb-4">Mã OTP đã gửi tới <b>{forgotEmail}</b></p>

            <div className="flex justify-center mb-4">
              <Input
                className="text-center text-2xl tracking-[0.5em] w-2/3 h-12 font-bold"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={handleVerifyForgotOtp}>Xác nhận</Button>
              <Button variant="ghost" className="w-full text-red-500" onClick={() => setShowForgotOtp(false)}>Quay lại</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}