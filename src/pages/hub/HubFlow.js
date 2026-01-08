import { useState } from 'react';
import HubMainPage from './HubMainPage';
import MT5CredentialsPage from './MT5CredentialsPage';
import MT5HistoryPage from './MT5HistoryPage';

const HubFlow = () => {
  const [currentPage, setCurrentPage] = useState('main');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('main');
  };

  switch (currentPage) {
    case 'credentials':
      return <MT5CredentialsPage onBack={handleBack} />;
    case 'history':
      return <MT5HistoryPage onBack={handleBack} />;
    default:
      return <HubMainPage onNavigate={handleNavigate} />;
  }
};

export default HubFlow;