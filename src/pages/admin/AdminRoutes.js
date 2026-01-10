import { useState } from 'react';
import AdminMainPage from './AdminMainPage';
import UserManagementPage from './UserManagementPage';
import AnalyticsPage from './AnalyticsPage';
import SecuritySettingsPage from './SecuritySettingsPage';
import PlatformSettingsPage from './PlatformSettingsPage';

const AdminRoutes = () => {
  const [currentPage, setCurrentPage] = useState('main');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('main');
  };

  switch (currentPage) {
    case 'users':
      return <UserManagementPage onBack={handleBack} />;
    case 'analytics':
      return <AnalyticsPage onBack={handleBack} />;
    case 'security':
      return <SecuritySettingsPage onBack={handleBack} />;
    case 'settings':
      return <PlatformSettingsPage onBack={handleBack} />;
    default:
      return <AdminMainPage onNavigate={handleNavigate} />;
  }
};

export default AdminRoutes;
