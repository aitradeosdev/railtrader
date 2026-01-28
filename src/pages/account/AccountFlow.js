import { useState } from 'react';
import AccountMainPage from './AccountMainPage';
import KYCPage from './KYCPage';
import PaymentMethodsPage from './PaymentMethodsPage';
import PersonalInfoPage from './PersonalInfoPage';
import AccountSettingsPage from './AccountSettingsPage';
import ChangePasswordPage from './ChangePasswordPage';
import TwoFactorSetupPage from './TwoFactorSetupPage';
import NotificationPreferencesPage from './NotificationPreferencesPage';
import KYCVerificationPage from './KYCVerificationPage';

const AccountFlow = () => {
  const [currentPage, setCurrentPage] = useState('main');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    if (currentPage === 'changePassword' || currentPage === 'twoFactorSetup' || currentPage === 'kycVerification') {
      setCurrentPage('settings');
    } else {
      setCurrentPage('main');
    }
  };

  switch (currentPage) {
    case 'profile':
      return <PersonalInfoPage onBack={handleBack} />;
    case 'kyc':
      return <KYCPage onBack={handleBack} />;
    case 'payout':
      return <PaymentMethodsPage onBack={handleBack} />;
    case 'settings':
      return <AccountSettingsPage onBack={handleBack} onNavigate={handleNavigate} />;
    case 'changePassword':
      return <ChangePasswordPage onBack={handleBack} />;
    case 'twoFactorSetup':
      return <TwoFactorSetupPage onBack={handleBack} />;
    case 'kycVerification':
      return <KYCVerificationPage onBack={handleBack} />;
    case 'notifications':
      return <NotificationPreferencesPage onBack={handleBack} />;
    default:
      return <AccountMainPage onNavigate={handleNavigate} />;
  }
};

export default AccountFlow;