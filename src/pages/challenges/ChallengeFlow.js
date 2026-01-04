import { useState } from 'react';
import ChallengesListPage from './ChallengesListPage';
import ChallengeConfigPage from './ChallengeConfigPage';
import ChallengePaymentPage from './ChallengePaymentPage';
import ChallengeSuccessPage from './ChallengeSuccessPage';

const ChallengeFlow = ({ onGoHome }) => {
  const [currentStep, setCurrentStep] = useState('list');
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

  const handlePaymentSuccess = () => {
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
    onGoHome();
  };

  switch (currentStep) {
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
          onGoHome={handleGoHome}
        />
      );
    default:
      return (
        <ChallengesListPage
          onSelectChallenge={handleSelectChallenge}
        />
      );
  }
};

export default ChallengeFlow;