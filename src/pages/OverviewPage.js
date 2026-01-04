import { GlassCard, MetricCard } from '../components/UIComponents';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

const OverviewPage = () => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Portfolio</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Funding status: <span className="text-blue-400">Elite Tier</span></p>
      </div>

    <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 no-scrollbar">
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Equity" value="$112,450" trend={2.4} subValue="Live Account" color="blue" /></div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Daily Loss" value="$1,240" trend={-0.8} subValue="Limit $5k" color="rose" /></div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Profit Target" value="74%" trend={15.2} subValue="Next Level" color="emerald" /></div>
      <div className="min-w-[280px] md:min-w-0 flex-shrink-0"><MetricCard label="Win Rate" value="68%" trend={1.2} subValue="Historical" color="purple" /></div>
    </div>

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