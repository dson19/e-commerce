import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các trang
import HomePage from './pages/HomePage'; // File Homepage của bạn
import SignInPage from './pages/SignInPage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from "@/components/ui/sonner";
import SignUpPage from './pages/SignUp';

import { AuthProvider } from './context/authContext';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import { CartProvider } from './context/cartContext';
import SearchPage from './pages/SearchPage';
import OrderPage from './pages/OrderPage';
import ProductsPage from './pages/ProductPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {


  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signUp" element={<SignUpPage />} />
            <Route path="/signIn" element={<SignInPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/category/:categoryId" element={<SearchPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/products" element={<ProductsPage />} />
            {/* SEO Friendly Product Route */}
            <Route path="/:parentCategory/:category/:slug" element={<ProductDetailPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrderPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;