import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
  const navigate = useNavigate();

  const {user, signOut, loading} = useAuth();

  // --- HÀM ĐĂNG XUẤT (Logic chính) ---
  const handleLogout = async () => {

    await signOut();
    navigate('/');
  };

  // --- GIAO DIỆN ---
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-8 mt-10">
        {user ? (
          // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800">Xin chào, {user.username}!</h1>
            <p className="text-gray-500 mb-6">{user.email}</p>

            <div className="space-y-3">
              <button className="w-full py-3 px-4 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
                📦 Đơn hàng của tôi
              </button>
              
              {/* Nút Đăng xuất */}
              <button 
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 font-bold transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa đăng nhập</h2>
            <p className="text-gray-500 mb-8">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
            
            <div className="flex gap-4 justify-center">
              <Link to="/signIn" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Đăng nhập
              </Link>
              <Link to="/signUp" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AccountPage;