import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const MT5HistoryPage = ({ onBack }) => {
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
      setChallenges(data.filter(c => c.mt5Accounts && c.mt5Accounts.length > 0));
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
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
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>MT5 History</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>All your assigned MT5 accounts</p>
        </div>
      </div>

      {challenges.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Trophy className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No MT5 History</h3>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>No MT5 accounts have been assigned yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {challenges.map(challenge => (
            <GlassCard key={challenge._id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {challenge.accountSize} {challenge.challengeType.toUpperCase()}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Created: {new Date(challenge.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  challenge.status === 'funded' ? 'bg-emerald-500/20 text-emerald-400' :
                  challenge.status === 'evaluation' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {challenge.status.toUpperCase().replace('_', ' ')}
                </div>
              </div>

              <div className="space-y-3">
                {challenge.mt5Accounts.map((account, index) => (
                  <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {account.accountType === 'live' ? 'Live Account' : `Phase ${account.phase} Account`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${account.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {account.active ? 'Active' : 'Inactive'}
                        </span>
                        {account.accountType === 'live' && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                            LIVE
                          </span>
                        )}
                      </div>
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
                      <div>
                        <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Assigned: </span>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>
                          {new Date(account.assignedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Type: </span>
                        <span className={`${isDark ? 'text-white' : 'text-gray-900'} capitalize`}>
                          {account.accountType || 'evaluation'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default MT5HistoryPage;