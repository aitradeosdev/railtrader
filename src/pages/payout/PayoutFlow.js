import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PayoutMainPage from './PayoutMainPage';
import PayoutAmountPage from './PayoutAmountPage';
import PayoutSuccessPage from './PayoutSuccessPage';

const PayoutFlow = ({ onGoHome }) => {
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState('main');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutDetails, setPayoutDetails] = useState(null);

  // Real-time data refresh
  const refreshData = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    // Update available balance when user data changes
    if (user?.accountBalance !== undefined) {
      setAvailableBalance(user.accountBalance);
    }
  }, [user]);

  useEffect(() => {
    // Set up interval for periodic refresh (every 30 seconds)
    const interval = setInterval(refreshData, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  const handleMethodSelect = (method, balance) => {
    setSelectedMethod(method);
    setAvailableBalance(balance);
    setCurrentStep('amount');
    // Refresh data when moving to amount page
    refreshData();
  };

  const handleBackToMain = () => {
    setCurrentStep('main');
    setSelectedMethod(null);
    // Refresh data when going back to main
    refreshData();
  };

  const handlePayoutConfirm = (details) => {
    setPayoutDetails(details);
    setCurrentStep('success');
    // Refresh data after payout confirmation
    refreshData();
  };

  const handleGoHome = () => {
    onGoHome();
  };

  switch (currentStep) {
    case 'amount':
      return (
        <PayoutAmountPage
          selectedMethod={selectedMethod}
          availableBalance={availableBalance}
          onBack={handleBackToMain}
          onConfirm={handlePayoutConfirm}
        />
      );
    case 'success':
      return (
        <PayoutSuccessPage
          payoutDetails={payoutDetails}
          onGoHome={handleGoHome}
        />
      );
    default:
      return (
        <PayoutMainPage
          onSelectMethod={handleMethodSelect}
        />
      );
  }
};

export default PayoutFlow;