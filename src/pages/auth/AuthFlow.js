import { useState } from 'react';
import LoginFlow from './login/LoginFlow';
import RegisterFlow from './register/RegisterFlow';

const AuthFlow = ({ onAuthSuccess, initialMode = 'login' }) => {
  const [currentFlow, setCurrentFlow] = useState(initialMode);

  const handleLogin = (credentials) => {
    // Simulate login - in real app, this would call an API
    console.log('Login attempt:', credentials);
    onAuthSuccess();
  };

  const handleRegister = (userData) => {
    // Simulate registration - in real app, this would call an API
    console.log('Registration attempt:', userData);
    onAuthSuccess();
  };

  const switchToRegister = () => setCurrentFlow('register');
  const switchToLogin = () => setCurrentFlow('login');

  if (currentFlow === 'register') {
    return (
      <RegisterFlow
        onRegister={handleRegister}
        onSwitchToLogin={switchToLogin}
      />
    );
  }

  return (
    <LoginFlow
      onLogin={handleLogin}
      onSwitchToRegister={switchToRegister}
    />
  );
};

export default AuthFlow;