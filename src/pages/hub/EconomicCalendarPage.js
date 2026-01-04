import { ArrowLeft, Calendar } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const EconomicCalendarPage = ({ onBack }) => {
  const { isDark } = useTheme();

  const economicEvents = [
    { time: '08:30', currency: 'USD', event: 'Non-Farm Payrolls', impact: 'high', forecast: '180K', previous: '175K' },
    { time: '10:00', currency: 'EUR', event: 'GDP Growth Rate', impact: 'medium', forecast: '0.3%', previous: '0.2%' },
    { time: '14:00', currency: 'GBP', event: 'Bank Rate Decision', impact: 'high', forecast: '5.25%', previous: '5.25%' },
    { time: '16:30', currency: 'CAD', event: 'Employment Change', impact: 'medium', forecast: '25K', previous: '22K' }
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
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Economic Calendar</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Today's economic events</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-400" size={24} />
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Events</h2>
        </div>
        
        <div className="space-y-3">
          {economicEvents.map((event, index) => (
            <div key={index} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{event.time}</span>
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-bold">{event.currency}</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.event}</span>
                <span className={`text-xs px-2 py-1 rounded ${getImpactColor(event.impact)}`}>
                  {event.impact.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Forecast: </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{event.forecast}</span>
                </div>
                <div>
                  <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Previous: </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{event.previous}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default EconomicCalendarPage;