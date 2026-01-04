import { Calendar, Zap, Newspaper, ExternalLink, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const HubMainPage = ({ onNavigate }) => {
  const { isDark } = useTheme();

  const economicEvents = [
    { time: '08:30', currency: 'USD', event: 'Non-Farm Payrolls', impact: 'high', forecast: '180K', previous: '175K' },
    { time: '10:00', currency: 'EUR', event: 'GDP Growth Rate', impact: 'medium', forecast: '0.3%', previous: '0.2%' },
    { time: '14:00', currency: 'GBP', event: 'Bank Rate Decision', impact: 'high', forecast: '5.25%', previous: '5.25%' }
  ];

  const tradingSignals = [
    { pair: 'EUR/USD', direction: 'BUY', entry: '1.0945', sl: '1.0920', tp: '1.0980', confidence: 85 },
    { pair: 'GBP/JPY', direction: 'SELL', entry: '188.50', sl: '189.20', tp: '187.30', confidence: 78 },
    { pair: 'USD/CAD', direction: 'BUY', entry: '1.3520', sl: '1.3480', tp: '1.3580', confidence: 72 }
  ];

  const marketNews = [
    { id: 1, title: 'Fed Signals Potential Rate Cut in Q2 2024', time: '2 hours ago', category: 'Central Banks' },
    { id: 2, title: 'EUR/USD Breaks Key Resistance at 1.0950', time: '4 hours ago', category: 'Technical Analysis' },
    { id: 3, title: 'Oil Prices Surge on Middle East Tensions', time: '6 hours ago', category: 'Commodities' }
  ];

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-amber-400 bg-amber-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return isDark ? 'text-white/60' : 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Trading Hub</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Your complete trading toolkit</p>
      </div>

      {/* MT5 Credentials Button */}
      <GlassCard className="p-6 cursor-pointer hover:scale-[1.02] transition-transform">
        <button
          onClick={() => onNavigate('credentials')}
          className="w-full text-left"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <ExternalLink className={`${isDark ? 'text-white' : 'text-gray-900'}`} size={24} />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>MT5 Credentials</h3>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Your trading account details</p>
            </div>
          </div>
        </button>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Calendar */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-400" size={20} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Economic Calendar</h2>
          </div>
          <div className="space-y-3">
            {economicEvents.map((event, index) => (
              <div key={index} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} text-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{event.time}</span>
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">{event.currency}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getImpactColor(event.impact)}`}>
                      {event.impact.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'} mt-1`}>{event.event}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Trading Signals */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-blue-400" size={20} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Trading Signals</h2>
          </div>
          <div className="space-y-3">
            {tradingSignals.map((signal, index) => (
              <div key={index} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{signal.pair}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    signal.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {signal.direction}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Entry:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{signal.entry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Confidence:</span>
                    <span className="text-blue-400">{signal.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Market News */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="text-blue-400" size={20} />
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Market News</h2>
        </div>
        <div className="space-y-3">
          {marketNews.map((news) => (
            <div key={news.id} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-between`}>
              <div className="flex-1">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm`}>{news.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{news.time}</span>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">{news.category}</span>
                </div>
              </div>
              <TrendingUp className={isDark ? 'text-white/40' : 'text-gray-400'} size={16} />
            </div>
          ))}
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default HubMainPage;