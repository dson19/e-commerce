import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signinSchema = z.object({
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
export function SigninForm({ className, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const onSubmit = (data) => {
    console.log("Form Data Submitted: ", data);
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img
                    src="/public/logo.svg"
                    alt="Logo"
                    className="w-10 h-auto"
                  />
                </a>
                <h1 className="text-2xl font-bold">Chào mừng quay lại</h1>
                <p className="text-sm text-gray-500">
                  Nhập thông tin của bạn để đăng nhập
                </p>
                </div>
              
              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className=" block text-sm">
                  Username
                </Label>
                <Input id="username" type="text" {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>
              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className=" block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* nút đăng nhập  */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Đăng nhập
              </Button>
              <div className="text-sm text-center">
                Chưa có tài khoản?{" "}
                <a href="/signup" className="text-primary hover:underline">
                  Đăng ký
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
