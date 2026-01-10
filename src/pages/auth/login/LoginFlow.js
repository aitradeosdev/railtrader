import { useState } from 'react';
import LoginEmailPage from './LoginEmailPage';
import LoginPasswordPage from './LoginPasswordPage';
import TwoFactorVerifyPage from './TwoFactorVerifyPage';

const LoginFlow = ({ onLogin, onSwitchToRegister }) => {
  const [currentStep, setCurrentStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailContinue = (data) => {
    setEmail(data.email);
    setCurrentStep('password');
  };

  const handlePasswordSubmit = (data) => {
    setPassword(data.password);
    setCurrentStep('twoFactor');
  };

  const handleBackToEmail = () => {
    setCurrentStep('email');
  };

  const handleBackToPassword = () => {
    setCurrentStep('password');
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
          onTwoFactorRequired={handlePasswordSubmit}
        />
      );
    case 'twoFactor':
      return (
        <TwoFactorVerifyPage
          email={email}
          password={password}
          onBack={handleBackToPassword}
          onSuccess={onLogin}
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