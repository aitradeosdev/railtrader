import { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const ChallengeDashboard = ({ onBuyNew }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChallenges = async () => {
    try {
      const response = await fetch(apiUrl('/user/challenges'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReview = async (challengeId) => {
    try {
      const response = await fetch(apiUrl(`/user/challenge/${challengeId}/review`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchChallenges();
      }
    } catch (error) {
      console.error('Error requesting review:', error);
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
    
    switch (status) {
      case 'pending': 
        return `Waiting for MT5 Assignment (Phase ${phase})`;
      case 'mt5_assigned': 
        return `MT5 Assigned - Check Trading Hub for Phase ${phase} credentials`;
      case 'evaluation': 
        if (challengeType === '2-phase' && phase === 1) {
          return 'Phase 1 Evaluation Under Review';
        } else if (challengeType === '2-phase' && phase === 2) {
          return 'Phase 2 Evaluation Under Review';
        }
        return 'Evaluation Under Review';
      case 'pending_funding':
        return 'Approved for Funding - Live Account Assignment Pending';
      case 'funded': 
        return 'Funded Account Approved - Check Trading Hub for Live credentials';
      case 'rejected': 
        return 'Challenge Rejected';
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
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Buy New Challenge
            </button>
          </div>
          <div className="space-y-4">
          {challenges.map(challenge => (
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
                             challenge.status === 'evaluation_2' ? '75%' :
                             challenge.status === 'evaluation' ? '50%' :
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Request Review
                  </button>
                )}
                {challenge.status === 'funded' && (
                  <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
                    Funded Account Active
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
