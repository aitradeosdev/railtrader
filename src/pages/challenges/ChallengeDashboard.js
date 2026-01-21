import { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const ChallengeDashboard = ({ onBuyNew }) => {
  const { isDark } = useTheme();
  const { token, user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingChallenges, setReviewingChallenges] = useState(new Set());

  useEffect(() => {
    fetchChallenges();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/user/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChallenges(Array.isArray(data) ? data : []);
      } else {
        // Handle error responses (like 403 for suspended users)
        setChallenges([]);
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.suspended) {
            // User is suspended, challenges will be empty
            console.log('User is suspended, cannot fetch challenges');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReview = async (challengeId) => {
    try {
      console.log('Requesting review for challenge:', challengeId);
      setReviewingChallenges(prev => new Set([...prev, challengeId]));
      
      const response = await fetch(`${apiUrl()}/api/user/challenge/${challengeId}/review`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Review response status:', response.status);
      const data = await response.json();
      console.log('Review response data:', data);
      
      if (response.ok) {
        fetchChallenges();
      } else {
        console.error('Review request failed:', data);
        alert(`Review request failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error requesting review:', error);
      alert(`Error requesting review: ${error.message}`);
    } finally {
      setReviewingChallenges(prev => {
        const newSet = new Set(prev);
        newSet.delete(challengeId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-400';
      case 'mt5_assigned': return 'text-blue-400';
      case 'evaluation': return 'text-purple-400';
      case 'evaluation_2': return 'text-purple-400';
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
      case 'evaluation_2': return <AlertCircle size={16} />;
      case 'pending_funding': return <Clock size={16} />;
      case 'funded': return <Trophy size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status, challenge) => {
    const phase = challenge?.currentPhase || 1;
    const challengeType = challenge?.challengeType || '1-phase';
    const reviewStatus = challenge?.reviewStatus;
    
    switch (status) {
      case 'pending': 
        return `Waiting for MT5 Assignment (Phase ${phase})`;
      case 'mt5_assigned': 
        return `MT5 Assigned - Check Trading Hub for Phase ${phase} credentials`;
      case 'evaluation': 
        if (reviewStatus === 'reviewing') {
          return 'Automated Review in Progress...';
        } else if (reviewStatus === 'completed') {
          return 'Review Completed - Processing Results';
        }
        if (challengeType === '1-phase') {
          return 'Ready for Review - Click "Request Review" to start automated evaluation';
        } else if (challengeType === '2-phase' && phase === 1) {
          return 'Phase 1 Ready for Review - Click "Request Review" to start automated evaluation';
        } else if (challengeType === '2-phase' && phase === 2) {
          return 'Phase 2 Ready for Review - Click "Request Review" to start automated evaluation';
        }
        return 'Ready for Review';
      case 'pending_funding':
        return 'Approved for Funding - Live Account Assignment Pending';
      case 'funded': 
        return 'Funded Account Approved - Check Trading Hub for Live credentials';
      case 'rejected': 
        return 'Challenge Rejected - Review failed automated evaluation';
      default: 
        return 'Unknown Status';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>My Challenges</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Track your challenge progress</p>
      </div>

      {challenges.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Trophy className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No Challenges Yet</h3>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Purchase a challenge to get started with your trading journey.</p>
          <button
            onClick={onBuyNew}
            disabled={user?.isSuspended}
            className={`px-6 py-3 rounded-xl transition-colors ${
              user?.isSuspended 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Buy Challenge
          </button>
        </GlassCard>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Challenges</h2>
            <button
              onClick={onBuyNew}
              disabled={user?.isSuspended}
              className={`px-4 py-2 rounded-xl transition-colors ${
                user?.isSuspended 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Buy New Challenge
            </button>
          </div>
          <div className="space-y-4">
          {Array.isArray(challenges) && challenges.map(challenge => (
            <GlassCard key={challenge._id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {challenge.accountSize} {challenge.challengeType.toUpperCase()} Challenge
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Purchased: {new Date(challenge.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(challenge.status)}`}>
                  {getStatusIcon(challenge.status)}
                  <span className="font-medium">{getStatusText(challenge.status, challenge)}</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Progress</span>
                  <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Phase: {challenge.currentPhase ? challenge.currentPhase.toString().replace('_', ' ').toUpperCase() : 'N/A'}
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: challenge.status === 'funded' ? '100%' : 
                             challenge.status === 'pending_funding' ? '90%' :
                             challenge.status === 'evaluation' && challenge.challengeType === '2-phase' && challenge.currentPhase === 2 ? '75%' :
                             challenge.status === 'evaluation' && (challenge.challengeType === '1-phase' || challenge.currentPhase === 1) ? '50%' :
                             challenge.status === 'mt5_assigned' ? '25%' : '10%'
                    }}
                  ></div>
                </div>
              </div>

              {/* Current MT5 Account */}
              {challenge.mt5Accounts && challenge.mt5Accounts.length > 0 && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} mb-4`}>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Current MT5 Account</h4>
                  {challenge.mt5Accounts.filter(acc => acc.active).map(account => (
                    <div key={account._id} className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Server:</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{account.server}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Login:</span>
                        <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>{account.login}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Phase:</span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>{account.phase ? account.phase.toString().replace('_', ' ').toUpperCase() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {challenge.status === 'mt5_assigned' && (
                  <button
                    onClick={() => handleRequestReview(challenge._id)}
                    disabled={reviewingChallenges.has(challenge._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {reviewingChallenges.has(challenge._id) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {reviewingChallenges.has(challenge._id) ? 'Submitting...' : 'Request Automated Review'}
                  </button>
                )}
                {challenge.status === 'evaluation' && challenge.reviewStatus === 'reviewing' && (
                  <div className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Automated Review in Progress
                  </div>
                )}
                {challenge.status === 'funded' && (
                  <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
                    Funded Account Active
                  </div>
                )}
                {challenge.status === 'rejected' && challenge.brymixResult && (
                  <div className="w-full">
                    <div className="px-4 py-2 bg-red-600 text-white rounded-xl mb-2">
                      Challenge Failed Automated Review
                    </div>
                    {challenge.brymixResult.violations && challenge.brymixResult.violations.length > 0 && (
                      <div className={`p-3 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'} text-sm`}>
                        <h5 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-700'} mb-2`}>Violations Found:</h5>
                        <ul className={`space-y-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                          {challenge.brymixResult.violations.slice(0, 3).map((violation, idx) => (
                            <li key={idx}>• {violation.description}</li>
                          ))}
                          {challenge.brymixResult.violations.length > 3 && (
                            <li>• And {challenge.brymixResult.violations.length - 3} more violations...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
        </>
      )}
    </div>
  );
};

export default ChallengeDashboard;