import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import DashboardView from '../components/admin/DashboardView';
import UserManagement from '../components/admin/UserManagement';
import ProductList from '../components/admin/ProductList';
import AddProductForm from '../components/admin/AddProductForm';
import OrderManagement from '../components/admin/OrderManagement';
import AddPromotionForm from '../components/admin/AddPromotionForm';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'users': return <UserManagement />;
      case 'orders': return <OrderManagement />;
      case 'products': return <ProductList setActiveTab={setActiveTab} />;
      case 'add-product': return <AddProductForm setActiveTab={setActiveTab} />;
      case 'promotions': return <AddPromotionForm onSuccess={() => {}} />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 ml-0 md:ml-64 min-w-0 transition-all duration-200">
        <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;