import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl()}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl()}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      await fetch(`${apiUrl()}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await fetch(`${apiUrl()}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
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
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Users className="text-blue-400" size={24} />
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Users</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-400" size={24} />
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Balance</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalBalance?.toFixed(2)}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={24} />
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Profit</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalProfit?.toFixed(2)}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-400" size={24} />
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>2FA Users</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.usersWithTwoFA}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Users Table */}
      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>User</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Balance</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Profit/Loss</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>2FA</th>
                <th className={`text-left p-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                      className={`w-20 p-1 rounded text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}
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
                      onClick={() => deleteUser(user._id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                    >
                      Delete
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

export default AdminDashboard;