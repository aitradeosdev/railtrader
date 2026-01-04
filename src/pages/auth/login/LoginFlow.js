import { useState } from 'react';
import LoginEmailPage from './LoginEmailPage';
import LoginPasswordPage from './LoginPasswordPage';

const LoginFlow = ({ onLogin, onSwitchToRegister }) => {
  const [currentStep, setCurrentStep] = useState('email');
  const [email, setEmail] = useState('');

  const handleEmailContinue = (data) => {
    setEmail(data.email);
    setCurrentStep('password');
  };

  const handleBackToEmail = () => {
    setCurrentStep('email');
  };

  const handleLogin = (credentials) => {
    onLogin(credentials);
  };

  switch (currentStep) {
    case 'password':
      return (
        <LoginPasswordPage
          email={email}
          onLogin={handleLogin}
          onBack={handleBackToEmail}
        />
      );
    default:
      return (
        <LoginEmailPage
          onContinue={handleEmailContinue}
          onSwitchToRegister={onSwitchToRegister}
        />
      );
  }
};

export default LoginFlow;