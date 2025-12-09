import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, MoveLeft, FileQuestion } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-4 text-center font-sans relative overflow-hidden">
      
      {/* Lớp nền số 404 (Trang trí) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <h1 className="text-[10rem] sm:text-[14rem] font-black text-gray-100 tracking-widest opacity-200">
          404
        </h1>
      </div>

      {/* Nội dung chính (Nổi lên trên) */}
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        
        {/* Icon */}
        <div className="bg-indigo-50 p-5 rounded-full mb-6 animate-bounce-slow">
          <FileQuestion size={40} className="text-[#564BF1]" />
        </div>

        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Page not found
        </h2>
        
        {/* Dòng mô tả */}
        <p className="text-gray-500 text-base leading-relaxed px-4">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        {/* Khu vực nút bấm - Đã chỉnh xuống thấp hơn bằng mt-10 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-10">
          
          {/* Nút Quay lại */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full sm:w-auto"
          >
            <MoveLeft size={18} />
            Go Back
          </button>

          {/* Nút Về trang chủ */}
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#564BF1] text-white font-medium hover:bg-[#4a40d4] transition-all shadow-md w-full sm:w-auto"
          >
            <Home size={18} />
            Back to Home
          </Link>
          
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;