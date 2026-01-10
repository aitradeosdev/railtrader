import { useState } from 'react';
import LandingPage from './LandingPage';
import AboutPage from './AboutPage';
import ChallengesPage from './ChallengesPage';
import RulesPage from './RulesPage';
import ContactPage from './ContactPage';

const LandingFlow = ({ onAuthRequest }) => {
  const [currentPage, setCurrentPage] = useState('home');

  const handleGetStarted = () => {
    onAuthRequest('register');
  };

  const handleSignIn = () => {
    onAuthRequest('login');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleAuthRequest = (mode) => {
    onAuthRequest(mode);
  };

  if (currentPage === 'about') {
    return <AboutPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'pricing') {
    return <ChallengesPage onGetStarted={handleGetStarted} onNavigate={handleNavigate} onAuthRequest={handleAuthRequest} />;
  }

  if (currentPage === 'features') {
    return <RulesPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'contact') {
    return <ContactPage onNavigate={handleNavigate} />;
  }

  return (
    <LandingPage 
      onGetStarted={handleGetStarted}
      onSignIn={handleSignIn}
      onNavigate={handleNavigate}
    />
  );
};

export default LandingFlow;
