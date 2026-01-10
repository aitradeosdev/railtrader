import { useState, useEffect } from 'react';
import { ArrowLeft, User, Trophy, Edit, Plus } from 'lucide-react';
import { GlassCard } from '../../../components/UIComponents';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { apiUrl } from '../../../utils/api';

const UserMT5Page = ({ userId, onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [mt5Credentials, setMt5Credentials] = useState({
    mt5Login: '',
    mt5Password: '',
    mt5Server: 'RailTrader-Live',
    accountType: 'evaluation'
  });

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserChallenges();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await response.json();
      const foundUser = users.find(u => u._id === userId);
      setUser(foundUser);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allChallenges = await response.json();
      const userChallenges = allChallenges.filter(c => c.userId._id === userId);
      setChallenges(userChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const handleAssignMT5ToChallenge = async (challengeId, credentials) => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenges/${challengeId}/assign-mt5`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          server: credentials.mt5Server,
          login: credentials.mt5Login,
          password: credentials.mt5Password,
          accountType: credentials.accountType
        })
      });

      if (response.ok) {
        fetchUserChallenges();
        setShowAssignModal(false);
        setNotification({
          type: 'success',
          message: 'MT5 credentials assigned successfully!'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error assigning MT5 to challenge:', error);
    }
  };

  const handleAssignCredentials = async () => {
    const userRequest = challenges.find(c => c.needsMT5 || c.needsLiveAccount);
    
    if (userRequest) {
      await handleAssignMT5ToChallenge(userRequest._id, mt5Credentials);
    } else {
      try {
        const response = await fetch(`${apiUrl()}/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(mt5Credentials)
        });

        if (response.ok) {
          fetchUserData();
          setShowAssignModal(false);
          setNotification({
            type: 'success',
            message: 'MT5 credentials assigned successfully!'
          });
          setTimeout(() => setNotification(null), 3000);
        }
      } catch (error) {
        console.error('Error assigning credentials:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>
              User Not Found
            </h1>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Implementation needed</p>
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
            {user.firstName} {user.lastName}
          </h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>MT5 Credential Management</p>
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
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Email:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Account Balance:</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{user.accountBalance?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>2FA Enabled:</span>
              <span className={user.twoFactorEnabled ? 'text-emerald-400' : 'text-red-400'}>
                {user.twoFactorEnabled ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-purple-400" size={24} />
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Current MT5 Credentials</h2>
            </div>
            <button
              onClick={() => {
                setMt5Credentials({
                  mt5Login: user.mt5Login || '',
                  mt5Password: user.mt5Password || '',
                  mt5Server: user.mt5Server || 'RailTrader-Live'
                });
                setShowAssignModal(true);
              }}
              className={`p-2 rounded-lg ${user.mt5Login ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white transition-colors`}
            >
              {user.mt5Login ? <Edit size={16} /> : <Plus size={16} />}
            </button>
          </div>
          
          {user.mt5Login || challenges.some(c => c.mt5Accounts && c.mt5Accounts.length > 0) ? (
          {user.mt5Login || challenges.some(c => c.mt5Accounts && c.mt5Accounts.length > 0) ? (
            <div className="space-y-3">
              {user.mt5Login && (
                <>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Server:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{user.mt5Server}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Login:</span>
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>{user.mt5Login}</span>
                  </div>
                </>
              )}
              {challenges.filter(c => c.mt5Accounts && c.mt5Accounts.length > 0).map(challenge => 
                challenge.mt5Accounts.filter(acc => acc.active).map((account, idx) => (
                  <div key={`${challenge._id}-${idx}`} className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Challenge MT5:</span>
                      <span className={`text-xs px-2 py-1 rounded ${account.accountType === 'live' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {account.accountType.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Server:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{account.server}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Login:</span>
                      <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>{account.login}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>No MT5 credentials assigned</p>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>User Challenges</h2>
        {challenges.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>No challenges found for this user</p>
        ) : (
          <div className="space-y-4">
            {challenges.map(challenge => (
              <div key={challenge._id} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {challenge.accountSize} {challenge.challengeType.toUpperCase()} - Phase {challenge.currentPhase}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      Status: {challenge.status} | Amount: {currency}{challenge.amount}
                      {challenge.needsLiveAccount && ' | Needs Live Account'}
                    </p>
                  </div>
                  {(challenge.needsMT5 || challenge.needsLiveAccount) && (
                    <button
                      onClick={() => {
                        setMt5Credentials({
                          mt5Login: '',
                          mt5Password: '',
                          mt5Server: 'RailTrader-Live',
                          accountType: challenge.needsLiveAccount ? 'live' : 'evaluation'
                        });
                        setShowAssignModal(true);
                      }}
                      className={`px-3 py-1 text-white text-xs rounded hover:opacity-80 ${
                        challenge.needsLiveAccount ? 'bg-orange-600' : 'bg-amber-600'
                      }`}
                    >
                      {challenge.needsLiveAccount ? 'Assign Live Account' : 'Assign MT5'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-6 w-full max-w-md mx-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Assign MT5 Credentials
            </h3>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-6`}>
              {user.firstName} {user.lastName}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  MT5 Server
                </label>
                <input
                  type="text"
                  value={mt5Credentials.mt5Server}
                  onChange={(e) => setMt5Credentials(prev => ({ ...prev, mt5Server: e.target.value }))}
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                  placeholder="RailTrader-Live"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  MT5 Login
                </label>
                <input
                  type="text"
                  value={mt5Credentials.mt5Login}
                  onChange={(e) => setMt5Credentials(prev => ({ ...prev, mt5Login: e.target.value }))}
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                  placeholder="Enter MT5 login"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  MT5 Password
                </label>
                <input
                  type="text"
                  value={mt5Credentials.mt5Password}
                  onChange={(e) => setMt5Credentials(prev => ({ ...prev, mt5Password: e.target.value }))}
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                  placeholder="Enter MT5 password"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                }}
                className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCredentials}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Assign
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default UserMT5Page;