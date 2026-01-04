import { ArrowLeft, Newspaper, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const MarketNewsPage = ({ onBack }) => {
  const { isDark } = useTheme();

  const marketNews = [
    { id: 1, title: 'Fed Signals Potential Rate Cut in Q2 2024', time: '2 hours ago', category: 'Central Banks', excerpt: 'Federal Reserve officials hint at possible monetary policy easing amid economic uncertainty.' },
    { id: 2, title: 'EUR/USD Breaks Key Resistance at 1.0950', time: '4 hours ago', category: 'Technical Analysis', excerpt: 'The euro strengthens against the dollar as it surpasses critical resistance level.' },
    { id: 3, title: 'Oil Prices Surge on Middle East Tensions', time: '6 hours ago', category: 'Commodities', excerpt: 'Crude oil futures jump 3% as geopolitical concerns drive energy markets higher.' },
    { id: 4, title: 'Tech Stocks Rally Continues Despite Rate Concerns', time: '8 hours ago', category: 'Equities', excerpt: 'Technology sector outperforms broader market as investors focus on earnings growth.' },
    { id: 5, title: 'Gold Reaches New Monthly High Amid Dollar Weakness', time: '10 hours ago', category: 'Precious Metals', excerpt: 'Precious metals gain momentum as USD index falls to multi-week lows.' },
    { id: 6, title: 'ECB Minutes Reveal Dovish Sentiment', time: '12 hours ago', category: 'Central Banks', excerpt: 'European Central Bank officials express caution about future rate hikes.' }
  ];

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Central Banks': return 'bg-blue-600/20 text-blue-400';
      case 'Technical Analysis': return 'bg-emerald-600/20 text-emerald-400';
      case 'Commodities': return 'bg-amber-600/20 text-amber-400';
      case 'Equities': return 'bg-purple-600/20 text-purple-400';
      case 'Precious Metals': return 'bg-yellow-600/20 text-yellow-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Market News</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Latest financial news and updates</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Newspaper className="text-blue-400" size={24} />
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Latest Updates</h2>
        </div>
        
        <div className="space-y-4">
          {marketNews.map((news) => (
            <div key={news.id} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} hover:bg-white/10 transition-colors cursor-pointer`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{news.title}</h4>
                  <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-600'} mb-3`}>{news.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{news.time}</span>
                    <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(news.category)}`}>{news.category}</span>
                  </div>
                </div>
                <TrendingUp className={isDark ? 'text-white/40' : 'text-gray-400'} size={20} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default MarketNewsPage;