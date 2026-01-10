import { useState } from 'react';
import UserDashboard from './UserDashboard';
import UserDetailsPage from './UserDetailsPage';
import EditUserPage from './EditUserPage';
import CreateUserPage from './CreateUserPage';
import AdminRoutes from './AdminRoutes';

const AdminUsersFlow = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleNavigate = (page, userId = null) => {
    setCurrentPage(page);
    setSelectedUserId(userId);
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
    setSelectedUserId(null);
  };

  switch (currentPage) {
    case 'user-details':
      return <UserDetailsPage onBack={handleBack} userId={selectedUserId} />;
    case 'edit-user':
      return <EditUserPage onBack={handleBack} userId={selectedUserId} />;
    case 'create-user':
      return <CreateUserPage onBack={handleBack} />;
    case 'settings':
      return <AdminRoutes />;
    default:
      return <UserDashboard onNavigate={handleNavigate} />;
  }
};

export default AdminUsersFlow;