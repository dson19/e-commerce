import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import {z} from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  firstName: z.string().min(1, "Tên bắt buộc phải có"),
  lastName: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});


export function SignupForm({ className, ...props }) {

   const{register, handleSubmit, formState: {errors,isSubmitting}} = useForm({
      resolver: zodResolver(signupSchema),
      defaultValues: {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
      },
    });
  const onSubmit = (data) => {
    console.log("Form Data Submitted: ", data);
  }

  return (

    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/public/logo.svg" alt="Logo" className="w-10 h-auto" />
                </a>
                <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
                <p className="text-sm text-gray-500">
                  Nhập thông tin của bạn để tạo tài khoản
                </p>
              </div>
              {/* họ và tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className=" block text-sm">
                    Họ
                  </Label>
                  <Input id="lastname" type="text" {...register("lastName")} />
                  {/* todo : error message */}
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstname" className=" block text-sm">
                    Tên
                  </Label>
                  <Input id="firstname" type="text" {...register("firstName")} />
                  {/* todo : error message */}
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                </div>
                </div>
                {/* username */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="username" className=" block text-sm">
                    Username
                  </Label>
                  <Input id="username" type="text" {...register("username")} />
                  {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </div>
                {/* email */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="email" className=" block text-sm">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="m@gmail.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                {/* password */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="password" className=" block text-sm">
                    Mật khẩu
                  </Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>
                {/* nút đăng kí */}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  Tạo tài khoản
                </Button>
                <div className="text-sm text-center">
                  Đã có tài khoản? {" "}
                  <a href="/login" className="text-primary hover:underline">
                    Đăng nhập
                  </a>
                </div>
              </div>
          </form>
          <div className="relative hidden md:block">
            <img
              src="/public/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-balance px-6 text-center *[a]:hover:text-primary text-muted-background *:[a]:underline *:[a]:underline-offset-4  ">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật</a>.
      </div>
    </div>
  );
}
