import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các trang
import Homepage from './page/Homepage'; // File Homepage của bạn
import AccountPage from './page/AccountPage';
import RegisterPage from './page/RegisterPage';
import SignInPage from './page/SignInPage';
import NotFoundPage from './page/NotFoundPage';
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/register" element={<RegisterPage />}  />
        <Route path ="/login" element={<SignInPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;