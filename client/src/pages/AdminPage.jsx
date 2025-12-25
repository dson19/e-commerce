import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import DashboardView from '../components/admin/DashboardView';
import UserManagement from '../components/admin/UserManagement';
import UserAnalytics from '../components/admin/UserAnalytics';
import ProductList from '../components/admin/ProductList';
import AddProductForm from '../components/admin/AddProductForm';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'users': return <UserManagement />;
      case 'user-analytics': return <UserAnalytics />;
      case 'products': return <ProductList setActiveTab={setActiveTab} />;
      case 'add-product': return <AddProductForm setActiveTab={setActiveTab} />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 min-w-0">
        <AdminHeader />
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;