import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const UserManagementPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      const response = await fetch('apiUrl('/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      await fetch(`apiUrl('/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await fetch(`apiUrl('/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} size={20} />
        </button>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl ${isDark ? 'bg-white/10 text-white placeholder-white/40' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border-none outline-none`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>User</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Balance</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Profit/Loss</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>2FA</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Admin</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  <td className="p-3">
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{user.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={user.accountBalance}
                      onChange={(e) => updateUser(user._id, { accountBalance: parseFloat(e.target.value) })}
                      className={`w-24 p-1 rounded text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}
                    />
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="text-green-400">${user.totalProfit.toFixed(2)}</div>
                      <div className="text-red-400">-${user.totalLoss.toFixed(2)}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.twoFactorEnabled 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => updateUser(user._id, { isAdmin: !user.isAdmin })}
                      className={`px-2 py-1 rounded text-xs ${
                        user.isAdmin 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {user.isAdmin ? 'Admin' : 'User'}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserManagementPage;
