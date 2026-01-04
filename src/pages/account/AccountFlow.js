import { useState } from 'react';
import AccountMainPage from './AccountMainPage';
import KYCPage from './KYCPage';
import PaymentMethodsPage from './PaymentMethodsPage';
import PersonalInfoPage from './PersonalInfoPage';
import AccountSettingsPage from './AccountSettingsPage';
import DocumentsPage from './DocumentsPage';
import NotificationPreferencesPage from './NotificationPreferencesPage';

const AccountFlow = () => {
  const [currentPage, setCurrentPage] = useState('main');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('main');
  };

  switch (currentPage) {
    case 'profile':
      return <PersonalInfoPage onBack={handleBack} />;
    case 'kyc':
      return <KYCPage onBack={handleBack} />;
    case 'payout':
      return <PaymentMethodsPage onBack={handleBack} />;
    case 'settings':
      return <AccountSettingsPage onBack={handleBack} />;
    case 'documents':
      return <DocumentsPage onBack={handleBack} />;
    case 'notifications':
      return <NotificationPreferencesPage onBack={handleBack} />;
    default:
      return <AccountMainPage onNavigate={handleNavigate} />;
  }
};

export default AccountFlow;