import { useState, useEffect } from 'react';
import { User, Search, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../../components/UIComponents';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

const MT5ManagementPage = ({ onNavigateToUser }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingMT5Requests, setPendingMT5Requests] = useState([]);
  const [pendingLiveRequests, setPendingLiveRequests] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchPendingMT5Requests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPendingMT5Requests = async () => {
    try {
      const response = await fetch('apiUrl('/admin/mt5-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingMT5Requests(data.filter(req => req.needsMT5 && !req.needsLiveAccount));
      setPendingLiveRequests(data.filter(req => req.needsLiveAccount));
    } catch (error) {
      console.error('Error fetching MT5 requests:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('apiUrl('/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>MT5 Management</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Manage MT5 credentials for all users</p>
      </div>

      {pendingLiveRequests.length > 0 && (
        <GlassCard className="p-4 border-l-4 border-orange-500">
          <h3 className={`font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'} mb-2`}>
            {pendingLiveRequests.length} Users Need Live Account Assignment
          </h3>
          <div className="space-y-2">
            {pendingLiveRequests.map(request => (
              <div key={request._id} className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {request.userId.firstName} {request.userId.lastName} - Live Account ({request.accountSize})
                </span>
                <button
                  onClick={() => onNavigateToUser(request.userId._id)}
                  className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 flex items-center gap-1"
                >
                  Assign Live <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {pendingMT5Requests.length > 0 && (
        <GlassCard className="p-4 border-l-4 border-amber-500">
          <h3 className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'} mb-2`}>
            {pendingMT5Requests.length} Users Need MT5 Assignment (Evaluation)
          </h3>
          <div className="space-y-2">
            {pendingMT5Requests.map(request => (
              <div key={request._id} className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {request.userId.firstName} {request.userId.lastName} - Phase {request.phase}
                </span>
                <button
                  onClick={() => onNavigateToUser(request.userId._id)}
                  className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 flex items-center gap-1"
                >
                  Manage <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

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

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>All Users</h2>
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user._id} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors`}
                 onClick={() => onNavigateToUser(user._id)}>
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
                      MT5: {user.mt5Login} | {user.mt5Server}
                    </p>
                  ) : (
                    <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>No MT5 credentials</p>
                  )}
                </div>
              </div>
              <ArrowRight className={isDark ? 'text-white/40' : 'text-gray-400'} size={20} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default MT5ManagementPage;
