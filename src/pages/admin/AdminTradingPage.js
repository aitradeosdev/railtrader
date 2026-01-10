import { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2, Search } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const AdminTradingPage = () => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingMT5Requests, setPendingMT5Requests] = useState([]);
  const [notification, setNotification] = useState(null);
  const [mt5Credentials, setMt5Credentials] = useState({
    mt5Login: '',
    mt5Password: '',
    mt5Server: 'RailTrader-Live'
  });

  useEffect(() => {
    fetchUsers();
    fetchChallenges();
    fetchPendingMT5Requests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPendingMT5Requests = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/mt5-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingMT5Requests(data);
    } catch (error) {
      console.error('Error fetching MT5 requests:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
          password: credentials.mt5Password
        })
      });

      if (response.ok) {
        fetchPendingMT5Requests();
        fetchUsers();
        setShowAssignModal(false);
        setSelectedUser(null);
        setMt5Credentials({ mt5Login: '', mt5Password: '', mt5Server: 'RailTrader-Live' });
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
    // Check if this user has pending MT5 requests
    const userRequest = pendingMT5Requests.find(req => req.userId._id === selectedUser._id);
    
    if (userRequest) {
      // Assign MT5 to the challenge
      await handleAssignMT5ToChallenge(userRequest._id, mt5Credentials);
    } else {
      // Regular user MT5 assignment (legacy)
      try {
        const response = await fetch(`${apiUrl()}/api/admin/users/${selectedUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(mt5Credentials)
        });

        if (response.ok) {
          fetchUsers();
          setShowAssignModal(false);
          setSelectedUser(null);
          setMt5Credentials({ mt5Login: '', mt5Password: '', mt5Server: 'RailTrader-Live' });
        }
      } catch (error) {
        console.error('Error assigning credentials:', error);
      }
    }
  };

  // Helper function to check if user has challenge-based MT5 credentials
  const getUserChallengeCredentials = (userId) => {
    const userChallenges = challenges.filter(c => c.userId && c.userId._id === userId);
    const credentialsArray = [];
    
    userChallenges.forEach(challenge => {
      if (challenge.mt5Accounts && challenge.mt5Accounts.length > 0) {
        challenge.mt5Accounts.filter(acc => acc.active).forEach(account => {
          credentialsArray.push({
            login: account.login,
            server: account.server,
            accountType: account.accountType,
            challengeId: challenge._id
          });
        });
      }
    });
    
    return credentialsArray;
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      {/* Notification */}
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

      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>MT5 Credentials Management</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Assign and manage MT5 trading credentials for users</p>
      </div>

      {/* MT5 Requests Alert */}
      {pendingMT5Requests.length > 0 && (
        <GlassCard className="p-4 border-l-4 border-amber-500">
          <h3 className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'} mb-2`}>
            {pendingMT5Requests.length} Users Need MT5 Assignment
          </h3>
          <div className="space-y-2">
            {pendingMT5Requests.map(request => (
              <div key={request._id} className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {request.userId.firstName} {request.userId.lastName} - Phase {request.phase}
                </span>
                <button
                  onClick={() => {
                    const user = users.find(u => u._id === request.userId._id);
                    setSelectedUser(user);
                    setMt5Credentials({
                      mt5Login: user?.mt5Login || '',
                      mt5Password: user?.mt5Password || '',
                      mt5Server: user?.mt5Server || 'RailTrader-Live'
                    });
                    setShowAssignModal(true);
                  }}
                  className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"
                >
                  Assign MT5
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Search */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white placeholder-white/40' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border-none outline-none`}
          />
        </div>
      </GlassCard>

      {/* Users List */}
      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Users & MT5 Credentials</h2>
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user._id} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center`}>
                  <User className={isDark ? 'text-white' : 'text-gray-600'} size={20} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{user.email}</p>
                  {user.mt5Login ? (
                    <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Legacy MT5: {user.mt5Login} | {user.mt5Server}
                    </p>
                  ) : null}
                  {(() => {
                    const challengeCredentials = getUserChallengeCredentials(user._id);
                    return challengeCredentials.length > 0 ? (
                      <div className="space-y-1">
                        {challengeCredentials.map((cred, idx) => (
                          <p key={idx} className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Challenge MT5: {cred.login} | {cred.server} ({cred.accountType.toUpperCase()})
                          </p>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  {!user.mt5Login && getUserChallengeCredentials(user._id).length === 0 && (
                    <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>No MT5 credentials</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
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
                {user.mt5Login && (
                  <button
                    onClick={() => {
                      // Remove credentials logic here
                    }}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-6 w-full max-w-md mx-4">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              {selectedUser?.mt5Login ? 'Edit' : 'Assign'} MT5 Credentials
            </h3>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-6`}>
              {selectedUser?.firstName} {selectedUser?.lastName}
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
                  setSelectedUser(null);
                }}
                className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCredentials}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                {selectedUser?.mt5Login ? 'Update' : 'Assign'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminTradingPage;