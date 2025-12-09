import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { Eye, EyeOff, Hexagon, User, Mail, Lock } from 'lucide-react';
import axios from 'axios'; // Thêm axios

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // State lưu thông báo lỗi

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- HÀM XỬ LÝ ĐĂNG KÝ ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi cũ

    // Validate nhanh
    if(formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }

    try {
      // 1. Gọi API Backend
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // 2. Nếu thành công (Status 201)
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login'); // Chuyển sang trang đăng nhập

    } catch (err) {
      // 3. Xử lý lỗi
      console.error(err);
      // Lấy thông báo lỗi từ Backend (ví dụ: "Email đã tồn tại")
      const msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Logo Area */}
      <div className="mb-8 flex items-center gap-2">
        <div className="p-1.5 bg-indigo-100 rounded-lg">
          <Hexagon className="text-indigo-600 fill-current" size={24} />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Mobile Shop</span>
      </div>

      <div className="bg-white w-full max-w-[440px] rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-500 text-sm">Join us to start shopping today.</p>
        </div>

        {/* --- KHU VỰC HIỂN THỊ LỖI --- */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Google Sign up Button (Giữ nguyên UI) */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-all mb-6 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="group-hover:text-gray-900">Sign up with Google</span>
        </button>

        {/* Divider OR */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">Or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username (Đã sửa name="username") */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
            <div className="relative">
                <input
                type="text"
                name="username" // ✅ Sửa fullName -> username để khớp Backend
                required
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all pl-10"
                onChange={handleChange}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
                <input
                type="email"
                name="email"
                required
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all pl-10"
                onChange={handleChange}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Create a password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all pl-10 pr-10"
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Must be at least 6 characters.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#564BF1] hover:bg-[#4a40d4] text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center mt-2"
          >
            Get started
          </button>
        </form>
      </div>

      {/* Footer Login Link */}
      <div className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
          Log in
        </Link>
      </div>

    </div>
  );
};

export default RegisterPage;