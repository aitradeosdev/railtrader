import { useState } from 'react';
import PayoutMainPage from './PayoutMainPage';
import PayoutAmountPage from './PayoutAmountPage';
import PayoutSuccessPage from './PayoutSuccessPage';

const PayoutFlow = ({ onGoHome }) => {
  const [currentStep, setCurrentStep] = useState('main');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutDetails, setPayoutDetails] = useState(null);

  const handleMethodSelect = (method, balance) => {
    setSelectedMethod(method);
    setAvailableBalance(balance);
    setCurrentStep('amount');
  };

  const handleBackToMain = () => {
    setCurrentStep('main');
    setSelectedMethod(null);
  };

  const handlePayoutConfirm = (details) => {
    setPayoutDetails(details);
    setCurrentStep('success');
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
