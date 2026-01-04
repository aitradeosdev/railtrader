import { ArrowLeft, Zap } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const TradingSignalsPage = ({ onBack }) => {
  const { isDark } = useTheme();

  const tradingSignals = [
    { pair: 'EUR/USD', direction: 'BUY', entry: '1.0945', sl: '1.0920', tp: '1.0980', confidence: 85 },
    { pair: 'GBP/JPY', direction: 'SELL', entry: '188.50', sl: '189.20', tp: '187.30', confidence: 78 },
    { pair: 'USD/CAD', direction: 'BUY', entry: '1.3520', sl: '1.3480', tp: '1.3580', confidence: 72 },
    { pair: 'AUD/USD', direction: 'SELL', entry: '0.6650', sl: '0.6680', tp: '0.6610', confidence: 80 },
    { pair: 'USD/JPY', direction: 'BUY', entry: '149.20', sl: '148.80', tp: '149.80', confidence: 75 },
    { pair: 'EUR/GBP', direction: 'SELL', entry: '0.8520', sl: '0.8550', tp: '0.8480', confidence: 68 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Trading Signals</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Market analysis and trading opportunities</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-blue-400" size={24} />
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Signals</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradingSignals.map((signal, index) => (
            <div key={index} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{signal.pair}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  signal.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {signal.direction}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Entry:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{signal.entry}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Stop Loss:</span>
                  <span className="text-red-400">{signal.sl}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Take Profit:</span>
                  <span className="text-emerald-400">{signal.tp}</span>
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

      <Footer />
    </div>
  );
};

export default TradingSignalsPage;