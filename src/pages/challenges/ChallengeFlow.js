import { useState } from 'react';
import ChallengesListPage from './ChallengesListPage';
import ChallengeConfigPage from './ChallengeConfigPage';
import ChallengePaymentPage from './ChallengePaymentPage';
import ChallengeSuccessPage from './ChallengeSuccessPage';
import ChallengeDashboard from './ChallengeDashboard';

const ChallengeFlow = ({ onGoHome }) => {
  const [currentStep, setCurrentStep] = useState('dashboard');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeConfig, setChallengeConfig] = useState(null);

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setCurrentStep('config');
  };

  const handleConfigComplete = (config) => {
    setChallengeConfig(config);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (challengeData) => {
    setSelectedChallenge(challengeData);
    setCurrentStep('success');
  };

  const handleBackToList = () => {
    setCurrentStep('list');
    setSelectedChallenge(null);
  };

  const handleBackToConfig = () => {
    setCurrentStep('config');
  };

  const handleGoHome = () => {
    setCurrentStep('dashboard');
  };

  const handleBuyNew = () => {
    setCurrentStep('list');
  };

  switch (currentStep) {
    case 'list':
      return (
        <ChallengesListPage
          onSelectChallenge={handleSelectChallenge}
          onBack={() => setCurrentStep('dashboard')}
        />
      );
    case 'config':
      return (
        <ChallengeConfigPage
          challenge={selectedChallenge}
          onBack={handleBackToList}
          onContinue={handleConfigComplete}
        />
      );
    case 'payment':
      return (
        <ChallengePaymentPage
          challenge={selectedChallenge}
          config={challengeConfig}
          onBack={handleBackToConfig}
          onSuccess={handlePaymentSuccess}
        />
      );
    case 'success':
      return (
        <ChallengeSuccessPage
          challenge={selectedChallenge}
          onGoHome={() => setCurrentStep('dashboard')}
        />
      );
    default:
      return (
        <ChallengeDashboard
          onBuyNew={handleBuyNew}
        />
      );
  }
};

export default ChallengeFlow;