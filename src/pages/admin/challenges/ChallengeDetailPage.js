import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../../components/UIComponents';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

const ChallengeDetailPage = ({ challengeId, onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (challengeId) {
      fetchChallengeData();
    }
  }, [challengeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChallengeData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/challenges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const challenges = await response.json();
      const foundChallenge = challenges.find(c => c._id === challengeId);
      setChallenge(foundChallenge);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const handleNotifyMT5Needed = async (phase) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/challenges/${challengeId}/notify-mt5`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phase, needsMT5: true })
      });
      
      if (response.ok) {
        fetchChallengeData();
        setNotification({
          type: 'success',
          message: 'Trading Hub notified - MT5 assignment needed'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error notifying MT5 needed:', error);
      setNotification({
        type: 'error',
        message: 'Failed to notify Trading Hub'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleNotifyLiveAccount = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/challenges/${challengeId}/notify-live-account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchChallengeData();
        setNotification({
          type: 'success',
          message: 'Trading Hub notified - Live account assignment needed'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error notifying live account needed:', error);
      setNotification({
        type: 'error',
        message: 'Failed to notify Trading Hub for live account'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCompleteEvaluation = async (action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/challenges/${challengeId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        fetchChallengeData();
        setShowModal(false);
        setNotification({
          type: 'success',
          message: 'Challenge status updated successfully'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-400';
      case 'mt5_assigned': return 'text-blue-400';
      case 'evaluation': return 'text-purple-400';
      case 'pending_funding': return 'text-orange-400';
      case 'funded': return 'text-emerald-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'mt5_assigned': return <CheckCircle size={16} />;
      case 'evaluation': return <AlertCircle size={16} />;
      case 'pending_funding': return <Clock size={16} />;
      case 'funded': return <Trophy size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (!challenge) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>
              Challenge Not Found
            </h1>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Loading challenge data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-xl border animate-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : isDark ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>
            Challenge Details
          </h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>
            {challenge.userId.firstName} {challenge.userId.lastName} - {challenge.accountSize} {challenge.challengeType.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-blue-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>User Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Name:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{challenge.userId.firstName} {challenge.userId.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Email:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{challenge.userId.email}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Created:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{new Date(challenge.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-purple-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenge Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Status:</span>
              <div className={`flex items-center gap-2 ${getStatusColor(challenge.status)}`}>
                {getStatusIcon(challenge.status)}
                <span className="font-medium">{challenge.status.toUpperCase().replace('_', ' ')}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Current Phase:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>Phase {challenge.currentPhase}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Amount:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>${challenge.amount}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Actions</h2>
        <div className="flex flex-wrap gap-3">
          {challenge.status === 'pending' && !challenge.needsMT5 && (
            <button
              onClick={() => handleNotifyMT5Needed(challenge.currentPhase)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Notify MT5 Needed (Phase {challenge.currentPhase})
            </button>
          )}
          {challenge.status === 'pending' && challenge.needsMT5 && (
            <span className="px-4 py-2 bg-amber-600 text-white rounded-xl">
              MT5 Assignment Pending (Phase {challenge.currentPhase})
            </span>
          )}
          {challenge.status === 'mt5_assigned' && (
            <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
              MT5 Assigned (Phase {challenge.currentPhase})
            </span>
          )}
          {challenge.status === 'evaluation' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              Review Evaluation
            </button>
          )}
          {challenge.status === 'pending_funding' && !challenge.needsLiveAccount && (
            <button
              onClick={handleNotifyLiveAccount}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
            >
              Notify Live Account Needed
            </button>
          )}
          {challenge.status === 'pending_funding' && challenge.needsLiveAccount && (
            <span className="px-4 py-2 bg-orange-600 text-white rounded-xl">
              Live Account Assignment Pending
            </span>
          )}
        </div>
      </GlassCard>

      {challenge.mt5Accounts && challenge.mt5Accounts.length > 0 && (
        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>MT5 Accounts</h2>
          <div className="space-y-4">
            {challenge.mt5Accounts.map((account, index) => (
              <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Phase {account.phase} Account
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${account.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {account.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Server: </span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{account.server}</span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Login: </span>
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>{account.login}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-6 w-full max-w-lg mx-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Challenge Progress Review
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>User:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {challenge.userId.firstName} {challenge.userId.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Challenge:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {challenge.accountSize} {challenge.challengeType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Current Phase:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  Phase {challenge.currentPhase}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Close
              </button>
              {challenge.challengeType === '2-phase' && challenge.currentPhase === 1 && (
                <button
                  onClick={() => handleCompleteEvaluation('next_phase')}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Complete Phase 1
                </button>
              )}
              <button
                onClick={() => handleCompleteEvaluation('approve_funded')}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Approve for Funding
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ChallengeDetailPage;