import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Sửa lại import cho chuẩn Alias @
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom"; // 1. Import chuyển trang
import axios from "axios"; // 2. Import axios
import { useState } from "react"; // 3. Import useState
import { toast } from "sonner"; // 4. Import sonner để hiển thị thông báo

const signupSchema = z.object({
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export function SignupForm({ className, ...props }) {
  const navigate = useNavigate(); // Hook chuyển trang
  const [apiError, setApiError] = useState(""); // State lưu lỗi từ Backend

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // --- LOGIC GỌI API ĐĂNG KÝ ---
  const onSubmit = async (data) => {
    setApiError(""); // Reset lỗi cũ

    try {
      // Gọi API Backend
      // Lưu ý: Backend hiện tại nhận { username, email, password }
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        // firstName, lastName: Tạm thời Backend chưa lưu 2 trường này, 
        // nhưng gửi kèm cũng không sao, Backend sẽ bỏ qua.
      });

      // Nếu thành công (Status 201)
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login"); // Chuyển sang trang đăng nhập

    } catch (error) {
      console.error(error);
      // Lấy thông báo lỗi từ Backend (ví dụ: Email đã tồn tại)
      const msg = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
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
                  {/* Sửa đường dẫn ảnh: Bỏ /public */}
                  <img src="/logo.svg" alt="Logo" className="w-10 h-auto" />
                </a>
                <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
                <p className="text-sm text-gray-500">
                  Nhập thông tin của bạn để tạo tài khoản
                </p>
              </div>

              

              {/* Họ và Tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input id="lastname" type="text" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">
                    Tên
                  </Label>
                  <Input id="firstname" type="text" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Username
                </Label>
                <Input id="username" type="text" {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@gmail.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              {/* KHU VỰC HIỂN THỊ LỖI API (Nếu có) */}
              {apiError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                  {apiError}
                </div>
              )}
              {/* Nút Đăng ký */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
              </Button>

              <div className="text-sm text-center">
                Đã có tài khoản?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>

          {/* Ảnh Placeholder */}
          <div className="relative hidden md:block bg-gray-100">
             {/* Sửa đường dẫn ảnh: Bỏ /public và thêm class full để đẹp hơn */}
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