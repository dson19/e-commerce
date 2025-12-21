import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Sửa lại import cho chuẩn Alias @
import { email, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom"; // 1. Import chuyển trang
import axios from "axios"; // 2. Import axios
import { useState } from "react"; // 3. Import useState
import { toast } from "sonner"; // 4. Import sonner để hiển thị thông báo
import OtpModal from "./otp-modal";
import { Link } from "react-router-dom";


const signupSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullname: z.string().min(1, "Vui lòng nhập họ và tên"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  gender: z.string().optional(),
});

export function SignupForm({ className, ...props }) {
  const navigate = useNavigate(); // Hook chuyển trang
  const [apiError, setApiError] = useState(""); // State lưu lỗi từ Backend
  const [showOtpModal, setShowOtpModal] = useState(false); // State hiển thị Modal
  const [registeredEmail, setRegisteredEmail] = useState(""); // Lưu email để xác thực
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      fullname: "",
      password: "",
      phoneNumber: "", 
      gender: "male", 
    },
  });

  // --- LOGIC GỌI API ĐĂNG KÝ ---
  const onSubmit = async (data) => {
    setApiError(""); // Reset lỗi cũ

    try {
      // Gọi API Backend
      await axios.post("http://localhost:5000/api/auth/signUp", {
        email: data.email,
        fullname: data.fullname,
        password: data.password,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
      });

      setRegisteredEmail(data.email);
      setShowOtpModal(true);


    } catch (error) {
      console.error(error);
      // Lấy thông báo lỗi từ Backend (ví dụ: Email đã tồn tại)
      const msg = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      setApiError(msg);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      
      {showOtpModal && (
        <OtpModal 
          isOpen={true} // Lúc nào render thì cũng là đang mở
          email={registeredEmail} 
          onClose={() => setShowOtpModal(false)}
        />
      )}
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

              
              {/* Họ và tên*/}
              <div className="flex flex-col gap-3">
                <Label htmlFor="fullname" className="block text-sm">
                  Họ và tên
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register("fullname")}
                />
                {errors.fullname && (
                  <p className="text-sm text-red-500">{errors.fullname.message}</p>
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

              {/* Số điện thoại */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="phoneNumber" className="block text-sm">
                  Số điện thoại
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Giới tính */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="gender" className="block text-sm">
                  Giới tính
                </Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("gender")}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
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
              {/* Sửa href thành to, thêm dấu /, và đổi về chữ thường nếu route của bạn là chữ thường */}
              <Link to="/signIn" className="hover:underline">
                Đăng nhập
              </Link>
            </div>
            </div>
          </form>

          {/* Ảnh Placeholder */}
          <div className="relative hidden md:block bg-gray-100">
            {/* Sửa đường dẫn ảnh: Bỏ /public và thêm class full để đẹp hơn */}
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
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