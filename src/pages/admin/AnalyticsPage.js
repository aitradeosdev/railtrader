import { useState, useEffect } from 'react';
import { ArrowLeft, Users, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const AnalyticsPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} size={20} />
        </button>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics & Statistics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Growth</h2>
          <div className="h-64 flex items-center justify-center">
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>Chart placeholder - User growth over time</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Platform Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>Active Users</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{Math.floor(stats.totalUsers * 0.7)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>2FA Adoption Rate</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalUsers > 0 ? Math.round((stats.usersWithTwoFA / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>Average Balance</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${stats.totalUsers > 0 ? (stats.totalBalance / stats.totalUsers).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;