import { useState } from 'react';
import RegisterBasicInfoPage from './RegisterBasicInfoPage';
import RegisterPasswordPage from './RegisterPasswordPage';

const RegisterFlow = ({ onRegister, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState('basicInfo');
  const [basicInfo, setBasicInfo] = useState({});

  const handleBasicInfoContinue = (data) => {
    setBasicInfo(data);
    setCurrentStep('password');
  };

  const handleBackToBasicInfo = () => {
    setCurrentStep('basicInfo');
  };

  const handleRegister = (userData) => {
    onRegister(userData);
  };

  switch (currentStep) {
    case 'password':
      return (
        <RegisterPasswordPage
          basicInfo={basicInfo}
          onRegister={handleRegister}
          onBack={handleBackToBasicInfo}
        />
      );
    default:
      return (
        <RegisterBasicInfoPage
          onContinue={handleBasicInfoContinue}
          onSwitchToLogin={onSwitchToLogin}
        />
      );
  }
};

export default RegisterFlow;
