import { useState } from 'react';
import KYCOverviewPage from './KYCOverviewPage';
import KYCVerifiedPage from './KYCVerifiedPage';
import KYCPendingPage from './KYCPendingPage';
import KYCRejectedPage from './KYCRejectedPage';

const KYCManagementFlow = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'verified':
        return <KYCVerifiedPage onBack={() => setActiveTab('overview')} />;
      case 'pending':
        return <KYCPendingPage onBack={() => setActiveTab('overview')} />;
      case 'rejected':
        return <KYCRejectedPage onBack={() => setActiveTab('overview')} />;
      default:
        return <KYCOverviewPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="pb-6">
      {renderContent()}
    </div>
  );
};

export default KYCManagementFlow;