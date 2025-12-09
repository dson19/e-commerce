import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Sửa lại đường dẫn import cho đúng chuẩn
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import axios from "axios"; // 2. Import axios
import { useState } from "react"; // Import useState để hiện lỗi API

// 3. Sửa Schema: Đăng nhập bằng Email chứ không phải Username
const signinSchema = z.object({
  email: z.string().email("Email không hợp lệ"), 
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export function SigninForm({ className, ...props }) {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(""); // State để lưu lỗi từ Backend

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "", // Sửa thành email
      password: "",
    },
  });

  // --- LOGIC GỌI API ---
  const onSubmit = async (data) => {
    setApiError(""); // Reset lỗi cũ

    try {
      // Gọi API Backend
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: data.email,
        password: data.password,
      });

      // Lưu Token và User vào LocalStorage
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Thông báo và chuyển trang
      alert("Đăng nhập thành công! Chào mừng " + user.username);
      navigate("/"); 

    } catch (error) {
      console.error(error);
      // Hiển thị lỗi từ server (ví dụ: Sai mật khẩu)
      const msg = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      setApiError(msg);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              
              {/* Header - Logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  {/* 4. Sửa đường dẫn ảnh: Bỏ /public */}
                  <img
                    src="/logo.svg" 
                    alt="Logo"
                    className="w-10 h-auto"
                  />
                </a>
                <h1 className="text-2xl font-bold">Chào mừng quay lại</h1>
                <p className="text-sm text-gray-500">
                  Nhập thông tin của bạn để đăng nhập
                </p>
              </div>

              {/* KHU VỰC HIỂN THỊ LỖI API (Nếu có) */}
              {apiError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                  {apiError}
                </div>
              )}

              {/* Email Field (Đã đổi từ Username -> Email) */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  {...register("email")} 
                />
                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" class="block text-sm">
                    Mật khẩu
                    </Label>
                    <a href="/forgot-password" class="text-sm text-primary hover:underline">Quên mật khẩu?</a>
                </div>
                
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Nút đăng nhập */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>

              <div className="text-sm text-center">
                Chưa có tài khoản?{" "}
                <a href="/register" className="text-primary hover:underline">
                  Đăng ký
                </a>
              </div>
            </div>
          </form>

          {/* Ảnh bên phải (Placeholder) */}
          <div className="relative hidden md:block bg-gray-100">
             {/* Sửa đường dẫn ảnh placeholder */}
            <img
              src="/placeholderSignUp.png" 
              alt="Image"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-balance px-6 text-center text-muted-foreground">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#" className="hover:text-primary underline underline-offset-4">Điều khoản dịch vụ</a> và{" "}
        <a href="#" className="hover:text-primary underline underline-offset-4">Chính sách bảo mật</a>.
      </div>
    </div>
  );
}