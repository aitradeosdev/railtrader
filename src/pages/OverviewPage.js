import { useState, useEffect, useCallback } from 'react';
import { GlassCard, MetricCard } from '../components/UIComponents';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiUrl } from '../utils/api';

const OverviewPage = () => {
  const { isDark } = useTheme();
  const { user, token, refreshUser } = useAuth();
  const { currency } = useCurrency();
  const [challengeBalances, setChallengeBalances] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  
  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch(`${apiUrl()}/api/user/dashboard-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl()}/api/user/activity`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const [statsData, activityData] = await Promise.all([
        statsRes.json(),
        activityRes.json()
      ]);
      
      setChallengeBalances(statsData.challengeBalances || []);
      setActivities(activityData.activities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Real-time data refresh
  const refreshData = useCallback(async () => {
    await Promise.all([refreshUser(), fetchDashboardData()]);
  }, [refreshUser, fetchDashboardData]);
  
  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    // Set up interval for periodic refresh (every 30 seconds)
    const interval = setInterval(refreshData, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);
  
  if (!user) return null;
  
  const totalFundedBalance = challengeBalances
    .filter(c => c.isFunded)
    .reduce((sum, c) => sum + c.amount, 0);
    
  const totalChallengeBalance = challengeBalances
    .filter(c => !c.isFunded)
    .reduce((sum, c) => sum + c.amount, 0);
  
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Welcome, {user.firstName}</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Account Status: <span className={user?.isSuspended ? 'text-red-400' : 'text-blue-400'}>{user?.isSuspended ? 'Suspended' : 'Active'}</span></p>
      </div>

      {user?.isSuspended && (
        <GlassCard className="p-6 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Suspended</h3>
          </div>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-sm`}>
            Your account has been suspended. You cannot use trading features, make payouts, or purchase challenges. Please contact support for assistance.
          </p>
        </GlassCard>
      )}

    <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 no-scrollbar">
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0">
        <MetricCard 
          label="Account Balance" 
          value={loading ? "Loading..." : `${currency}${totalFundedBalance.toLocaleString()}`} 
          trend={0} 
          subValue={totalFundedBalance > 0 ? "Live Funded" : (totalChallengeBalance > 0 ? "Challenge Phase" : "No Challenges")} 
          color="blue" 
        />
      </div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Total Profit" value={`${currency}${(user.totalProfit || 0).toLocaleString()}`} trend={0} subValue="All Time" color="emerald" /></div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Total Loss" value={`${currency}${(user.totalLoss || 0).toLocaleString()}`} trend={0} subValue="All Time" color="rose" /></div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Win Rate" value={`${user.winRate || 0}%`} trend={0} subValue="Historical" color="purple" /></div>
    </div>

    {challengeBalances.length > 0 && (
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenge Balances</h2>
          {challengeBalances.length > 2 && (
            <button 
              onClick={() => setShowAllChallenges(!showAllChallenges)}
              className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
            >
              {showAllChallenges ? 'View Less' : 'View All'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showAllChallenges ? challengeBalances : challengeBalances.slice(0, 2)).map((challenge, index) => (
            <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {challenge.accountSize} Account
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  challenge.isFunded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {challenge.isFunded ? 'Live Funded' : 'Challenge Phase'}
                </span>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currency}{challenge.amount ? challenge.amount.toLocaleString() : '0'}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      <GlassCard className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity</h2>
          {activities.length > 2 && (
            <button 
              onClick={() => setShowAllActivities(!showAllActivities)}
              className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
            >
              {showAllActivities ? 'View Less' : 'View All'}
            </button>
          )}
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} text-center py-8`}>Loading activities...</div>
          ) : activities.length > 0 ? (
            (showAllActivities ? activities : activities.slice(0, 2)).map((activity, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-2xl ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/20 border-white/30'} border hover:${isDark ? 'bg-white/10' : 'bg-white/30'} transition-colors`}>
                <span className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>{activity.title}</span>
                <span className={`text-sm font-bold ${activity.color}`}>{activity.value}</span>
              </div>
            ))
          ) : (
            <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} text-center py-8`}>No recent activity</div>
          )}
        </div>
      </GlassCard>
    </div>
    <Footer />
  </div>
);
};

export default OverviewPage;