import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Trash2, Shield, TrendingUp, DollarSign } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const UserDashboard = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/users`, {
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

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await fetch(`${apiUrl()}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'admin' && user.isAdmin) ||
                           (filterStatus === 'user' && !user.isAdmin) ||
                           (filterStatus === '2fa' && user.twoFactorEnabled) ||
                           (filterStatus === 'no2fa' && !user.twoFactorEnabled);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'name') {
        aVal = `${a.firstName} ${a.lastName}`;
        bVal = `${b.firstName} ${b.lastName}`;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const totalBalance = users.reduce((sum, user) => sum + user.accountBalance, 0);
  const totalProfit = users.reduce((sum, user) => sum + user.totalProfit, 0);
  const adminCount = users.filter(user => user.isAdmin).length;
  const twoFACount = users.filter(user => user.twoFactorEnabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>User Dashboard</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Comprehensive user management and analytics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Shield className="text-blue-400" size={24} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Users</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{adminCount} admins</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <DollarSign className="text-green-400" size={24} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Balance</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${totalBalance.toLocaleString()}</p>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Platform funds</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Profit</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${totalProfit.toLocaleString()}</p>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Generated</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Shield className="text-purple-400" size={24} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>2FA Enabled</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{twoFACount}</p>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{Math.round((twoFACount/users.length)*100)}% adoption</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white placeholder-white/40' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border-none outline-none`}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="user">Regular Users</option>
              <option value="2fa">2FA Enabled</option>
              <option value="no2fa">No 2FA</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className={`px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="accountBalance-desc">Highest Balance</option>
              <option value="accountBalance-asc">Lowest Balance</option>
            </select>

            <button 
              onClick={() => onNavigate('create-user')}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add User
            </button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedUsers.map((user) => (
            <div key={user._id} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border hover:${isDark ? 'bg-white/10' : 'bg-gray-100'} transition-colors`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {user.isAdmin && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded flex items-center gap-1">
                      <Shield size={12} />
                      Admin
                    </span>
                  )}
                  {user.twoFactorEnabled && (
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                      2FA
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Balance</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${user.accountBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Win Rate</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.winRate}%</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Profit</p>
                  <p className="font-bold text-emerald-400">${user.totalProfit.toFixed(2)}</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Joined</p>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate('user-details', user._id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View
                </button>
                <button 
                  onClick={() => onNavigate('edit-user', user._id)}
                  className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-600'}`}>No users found matching your criteria</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default UserDashboard;