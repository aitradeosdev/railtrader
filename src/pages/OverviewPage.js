import { useState, useEffect } from 'react';
import { GlassCard, MetricCard } from '../components/UIComponents';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiUrl } from '../utils/api';

const OverviewPage = () => {
  const { isDark } = useTheme();
  const { user, token } = useAuth();
  const { currency } = useCurrency();
  const [challengeBalances, setChallengeBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/user/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChallengeBalances(data.challengeBalances || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Account Status: <span className="text-blue-400">Active</span></p>
      </div>

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
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Total Profit" value={`${currency}${user.totalProfit.toLocaleString()}`} trend={0} subValue="All Time" color="emerald" /></div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Total Loss" value={`${currency}${user.totalLoss.toLocaleString()}`} trend={0} subValue="All Time" color="rose" /></div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Win Rate" value={`${user.winRate}%`} trend={0} subValue="Historical" color="purple" /></div>
    </div>

    {challengeBalances.length > 0 && (
      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Challenge Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challengeBalances.map((challenge, index) => (
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

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="lg:col-span-2 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance</h2>
          <div className={`flex ${isDark ? 'bg-white/5' : 'bg-white/20'} rounded-full p-1 ${isDark ? 'border-white/10' : 'border-white/30'} border text-[10px]`}>
            {['1D', '1W', '1M'].map(t => (
              <button key={t} className={`px-3 py-1 rounded-full transition-all ${t === '1W' ? (isDark ? 'bg-white text-black' : 'bg-gray-900 text-white') : (isDark ? 'text-white/60' : 'text-gray-600')}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="h-48 md:h-64 w-full flex items-end gap-1 md:gap-2">
           {[30, 50, 40, 80, 60, 90, 70, 85, 95, 100].map((h, i) => (
             <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-300/10 rounded-t-md md:rounded-t-lg transition-all duration-700" />
           ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 md:p-8">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Activity</h2>
        <div className="space-y-4">
          {[{ t: "Payout", v: "+$2.5k", c: "text-emerald-400" }, { t: "Risk Alert", v: "Limit", c: "text-rose-400" }, { t: "New Badge", v: "Unlocked", c: "text-amber-400" }].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-2xl ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/20 border-white/30'} border`}>
              <span className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>{item.t}</span>
              <span className={`text-sm font-bold ${item.c}`}>{item.v}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
    <Footer />
  </div>
);
};

export default OverviewPage;