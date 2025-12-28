import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Có thể thay bằng component Loading spinner nếu muốn
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/signIn" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
