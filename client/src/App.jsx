import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các trang
import Homepage from './pages/Homepage'; // File Homepage của bạn
import AccountPage from './pages/AccountPage';
import SignInPage from './pages/SignInPage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from "@/components/ui/sonner";
import SignUpPage from './pages/SignUp';
import { useState } from 'react';
import { AuthProvider } from './context/authContext';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/signUp" element={<SignUpPage />}  />
          <Route path ="/signIn" element={<SignInPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;