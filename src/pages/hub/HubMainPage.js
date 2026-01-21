import { ExternalLink, History } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const HubMainPage = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  if (user?.isSuspended) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
        <div className="flex flex-col gap-2">
          <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Trading Hub</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Your complete trading toolkit</p>
        </div>

        <GlassCard className="p-8 text-center border border-red-500/20 bg-red-500/5">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Account Suspended</h3>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Trading hub access is restricted while your account is suspended.</p>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Please contact support for assistance.</p>
        </GlassCard>

        <Footer />
      </div>
    );
  }

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