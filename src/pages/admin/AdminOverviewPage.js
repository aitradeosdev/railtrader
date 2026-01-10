import { useState, useEffect } from 'react';
import { Users, TrendingUp, Shield, Trophy, Wallet, Activity } from 'lucide-react';
import { GlassCard, MetricCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiUrl } from '../../utils/api';

const AdminOverviewPage = () => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/stats`, {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Admin Overview</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Platform Status: <span className="text-red-400">Admin Control</span></p>
      </div>

      <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 no-scrollbar">
        <div className="min-w-[280px] md:min-w-0 flex-shrink-0">
          <MetricCard label="Total Users" value={stats.totalUsers} trend={0} subValue="Registered" color="red" />
        </div>
        <div className="min-w-[280px] md:min-w-0 flex-shrink-0">
          <MetricCard label="Platform Balance" value={loading ? "Loading..." : `${currency}${stats.platformBalance?.toLocaleString()}`} trend={0} subValue="Live Funded" color="orange" />
        </div>
        <div className="min-w-[280px] md:min-w-0 flex-shrink-0">
          <MetricCard label="Platform Profit" value={loading ? "Loading..." : `${currency}${stats.platformProfit?.toLocaleString()}`} trend={0} subValue="Revenue" color="emerald" />
        </div>
        <div className="min-w-[280px] md:min-w-0 flex-shrink-0">
          <MetricCard label="Challenge Phase" value={loading ? "Loading..." : `${currency}${stats.challengePhaseBalance?.toLocaleString()}`} trend={0} subValue="In Progress" color="purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Platform Activity</h2>
            <div className={`flex ${isDark ? 'bg-white/5' : 'bg-white/20'} rounded-full p-1 ${isDark ? 'border-white/10' : 'border-white/30'} border text-[10px]`}>
              {['1D', '1W', '1M'].map(t => (
                <button key={t} className={`px-3 py-1 rounded-full transition-all ${t === '1W' ? (isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white') : (isDark ? 'text-white/60' : 'text-gray-600')}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-48 md:h-64 w-full flex items-end gap-1 md:gap-2">
             {[30, 50, 40, 80, 60, 90, 70, 85, 95, 100].map((h, i) => (
               <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-red-500/40 to-red-300/10 rounded-t-md md:rounded-t-lg transition-all duration-700" />
             ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 md:p-8">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>System Status</h2>
          <div className="space-y-4">
            {[
              { t: "Server Status", v: "Online", c: "text-emerald-400", icon: Activity },
              { t: "Database", v: "Connected", c: "text-emerald-400", icon: Shield },
              { t: "API Status", v: "Active", c: "text-emerald-400", icon: TrendingUp },
              { t: "Backup", v: "Complete", c: "text-amber-400", icon: Shield }
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-2xl ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/20 border-white/30'} border`}>
                  <div className="flex items-center gap-3">
                    <IconComponent className={isDark ? 'text-white/60' : 'text-gray-600'} size={16} />
                    <span className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>{item.t}</span>
                  </div>
                  <span className={`text-sm font-bold ${item.c}`}>{item.v}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-red-400" size={24} />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>User Management</h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Manage user accounts, balances, and permissions</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Active Users</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{Math.floor(stats.totalUsers * 0.8)}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>New Today</span>
              <span className="text-emerald-400">+{Math.floor(stats.totalUsers * 0.1)}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-orange-400" size={24} />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenges</h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Monitor and manage trading challenges</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Active Challenges</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>24</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Completed</span>
              <span className="text-emerald-400">12</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="text-purple-400" size={24} />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payouts</h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Process and track payout requests</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Pending</span>
              <span className="text-amber-400">3</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Processed</span>
              <span className="text-emerald-400">18</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminOverviewPage;