import { CheckCircle, Home } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const ChallengeSuccessPage = ({ challenge, onGoHome }) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>
        </div>
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter mb-4`}>
          Challenge Activated!
        </h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-lg`}>
          Your {challenge.name} challenge is now active and ready to trade.
        </p>
      </div>

      <GlassCard className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Account Balance</h3>
              <p className="text-2xl font-black text-blue-400">${challenge.accountSize?.toLocaleString() || '10,000'}</p>
            </div>
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Profit Target</h3>
              <p className="text-2xl font-black text-emerald-400">{challenge.phases?.[1]?.profitTarget || challenge.phases?.[2]?.profitTarget || 20}%</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Next Steps</h3>
            <div className={`text-left space-y-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              <p>• Download your trading platform credentials</p>
              <p>• Review the challenge rules and guidelines</p>
              <p>• Start trading to reach your profit target</p>
              <p>• Monitor your progress in the dashboard</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onGoHome}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
            >
              <Home size={20} />
              Go to Dashboard
            </button>
            <button className={`flex-1 py-4 ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} font-bold rounded-2xl transition-colors`}>
              Download Credentials
            </button>
          </div>
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default ChallengeSuccessPage;
