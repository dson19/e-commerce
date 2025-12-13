import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import các trang
import Homepage from './page/Homepage'; // File Homepage của bạn
import AccountPage from './page/AccountPage';
import SignInPage from './page/SignInPage';
import NotFoundPage from './page/NotFoundPage';
import { Toaster } from "@/components/ui/sonner";
import SignUpPage from './page/SignUp';
import { useState } from 'react';
import { AuthProvider } from './context/authContext';

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;