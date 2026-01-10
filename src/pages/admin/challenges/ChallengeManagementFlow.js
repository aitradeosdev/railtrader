import { useState } from 'react';
import ChallengeManagementPage from './ChallengeManagementPage';
import ChallengeDetailPage from './ChallengeDetailPage';

const ChallengeManagementFlow = () => {
  const [currentPage, setCurrentPage] = useState('management');
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  const handleNavigateToChallenge = (challengeId) => {
    setSelectedChallengeId(challengeId);
    setCurrentPage('detail');
  };

  const handleBackToManagement = () => {
    setCurrentPage('management');
    setSelectedChallengeId(null);
  };

  switch (currentPage) {
    case 'detail':
      return (
        <ChallengeDetailPage
          challengeId={selectedChallengeId}
          onBack={handleBackToManagement}
        />
      );
    default:
      return (
        <ChallengeManagementPage
          onNavigateToChallenge={handleNavigateToChallenge}
        />
      );
  }
};

export default ChallengeManagementFlow;
