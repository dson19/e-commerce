import React from 'react';
import Header from './Header';
import Footer from './Footer';
// import Footer from './Footer'; (Làm sau)

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 max-w-[1200px] py-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;