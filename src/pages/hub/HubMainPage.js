import { ExternalLink, History } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const HubMainPage = ({ onNavigate }) => {
  const { isDark } = useTheme();

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
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Your current trading account details</p>
            </div>
          </div>
        </button>
      </GlassCard>

      {/* MT5 History Button */}
      <GlassCard className="p-6 cursor-pointer hover:scale-[1.02] transition-transform">
        <button
          onClick={() => onNavigate('history')}
          className="w-full text-left"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <History className={`${isDark ? 'text-white' : 'text-gray-900'}`} size={24} />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>MT5 History</h3>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>All your assigned MT5 accounts by challenge</p>
            </div>
          </div>
        </button>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default HubMainPage;
