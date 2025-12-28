import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({adminOnly = false}) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Có thể thay bằng component Loading spinner nếu muốn
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/signIn" replace />;
    }
    //user tự động vào route admin = cút 
    if (user.role !== 'admin' && adminOnly) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
