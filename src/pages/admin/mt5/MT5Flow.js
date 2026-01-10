import { useState } from 'react';
import MT5ManagementPage from './MT5ManagementPage';
import UserMT5Page from './UserMT5Page';

const MT5Flow = () => {
  const [currentPage, setCurrentPage] = useState('management');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleNavigateToUser = (userId) => {
    setSelectedUserId(userId);
    setCurrentPage('user');
  };

  const handleBackToManagement = () => {
    setCurrentPage('management');
    setSelectedUserId(null);
  };

  switch (currentPage) {
    case 'user':
      return (
        <UserMT5Page
          userId={selectedUserId}
          onBack={handleBackToManagement}
        />
      );
    default:
      return (
        <MT5ManagementPage
          onNavigateToUser={handleNavigateToUser}
        />
      );
  }
};

export default MT5Flow;