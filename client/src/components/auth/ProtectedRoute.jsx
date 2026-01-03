import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({adminOnly = false}) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        // Có thể thay bằng component Loading spinner nếu muốn
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/signIn" state={{ from: location }} replace />;
    }
    //user tự động vào route admin = cút 
    if (user.role !== 'admin' && adminOnly) {
        console.log("🚫 Bị chặn bởi ProtectedRoute!");
        console.log("User hiện tại:", user);
        console.log("Role user:", user?.role);
        console.log("Yêu cầu role: admin");
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
