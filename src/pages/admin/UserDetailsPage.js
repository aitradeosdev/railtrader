import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Shield, Smartphone, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiUrl } from '../../utils/api';

const UserDetailsPage = ({ onBack, userId }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUser = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await response.json();
      const foundUser = users.find(u => u._id === userId);
      setUser(foundUser);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-600'}`}>User not found</p>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} size={20} />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>User Details</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>Complete user information and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <GlassCard className="p-6">
          <div className="text-center mb-6">
            <div className={`w-24 h-24 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center mx-auto mb-4`}>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.firstName} {user.lastName}
            </h2>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>{user.email}</p>
            
            <div className="flex justify-center gap-2 mt-4">
              {user.isAdmin && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center gap-1">
                  <Shield size={14} />
                  Administrator
                </span>
              )}
              {user.twoFactorEnabled && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full flex items-center gap-1">
                  <Smartphone size={14} />
                  2FA Enabled
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className={isDark ? 'text-white/40' : 'text-gray-400'} size={20} />
              <div>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Full Name</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className={isDark ? 'text-white/40' : 'text-gray-400'} size={20} />
              <div>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Email Address</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className={isDark ? 'text-white/40' : 'text-gray-400'} size={20} />
              <div>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Member Since</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Financial Overview */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Financial Overview</h3>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <DollarSign className="text-blue-400" size={24} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Account Balance</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currency}{user.accountBalance.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <TrendingUp className="text-emerald-400" size={24} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Profit</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {currency}{user.totalProfit.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <TrendingUp className="text-red-400 rotate-180" size={24} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Loss</p>
                <p className="text-2xl font-bold text-red-400">
                  {currency}{user.totalLoss.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Activity className="text-purple-400" size={24} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Win Rate</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user.winRate}%
                </p>
              </div>
            </div>
          </div>

          {/* Net P&L */}
          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-2`}>Net Profit/Loss</p>
            <p className={`text-xl font-bold ${user.totalProfit - user.totalLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {currency}{(user.totalProfit - user.totalLoss).toLocaleString()}
            </p>
          </div>
        </GlassCard>

        {/* Account Status & Security */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Account Status & Security</h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Status</span>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                  Active
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Account is active and in good standing
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</span>
                <span className={`px-2 py-1 text-xs rounded ${
                  user.twoFactorEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                {user.twoFactorEnabled 
                  ? 'Account is secured with 2FA' 
                  : 'Account is not using 2FA security'
                }
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Type</span>
                <span className={`px-2 py-1 text-xs rounded ${
                  user.isAdmin 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.isAdmin ? 'Administrator' : 'Regular User'}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                {user.isAdmin 
                  ? 'Has administrative privileges' 
                  : 'Standard user account'
                }
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Last Activity</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  Recent
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Last seen today
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => window.location.href = `mailto:${user.email}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Send Email
        </button>
        <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
          Edit User
        </button>
        <button className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default UserDetailsPage;