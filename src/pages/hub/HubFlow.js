import { useState } from 'react';
import HubMainPage from './HubMainPage';
import EconomicCalendarPage from './EconomicCalendarPage';
import TradingSignalsPage from './TradingSignalsPage';
import MarketNewsPage from './MarketNewsPage';
import MT5CredentialsPage from './MT5CredentialsPage';

const HubFlow = () => {
  const [currentPage, setCurrentPage] = useState('main');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('main');
  };

  switch (currentPage) {
    case 'calendar':
      return <EconomicCalendarPage onBack={handleBack} />;
    case 'signals':
      return <TradingSignalsPage onBack={handleBack} />;
    case 'news':
      return <MarketNewsPage onBack={handleBack} />;
    case 'credentials':
      return <MT5CredentialsPage onBack={handleBack} />;
    default:
      return <HubMainPage onNavigate={handleNavigate} />;
  }
};

export default HubFlow;