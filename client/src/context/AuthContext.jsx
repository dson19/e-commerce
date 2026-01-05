import { authService } from '../services/api';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await authService.getMe();
                if (res.data.success && res.data.data) {
                    setUser(res.data.data);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const signIn = async (user) => {
        setUser(user);
        toast.success("Đăng nhập thành công");
    }

    const logout = async () => {
        try {
            await authService.signOut();
            setUser(null);
            toast.success("Đã đăng xuất");
        } catch {
            toast.error("Lỗi đăng xuất");
        }
    };

        const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};