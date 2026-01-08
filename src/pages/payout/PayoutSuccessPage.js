import { Clock, Home } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const PayoutSuccessPage = ({ payoutDetails, onGoHome }) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center">
            <Clock className="text-amber-400" size={40} />
          </div>
        </div>
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter mb-4`}>
          Payout Request Submitted!
        </h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-lg`}>
          Your payout request is pending admin review and approval.
        </p>
      </div>

      <GlassCard className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Requested Amount</h3>
            <p className="text-2xl font-black text-amber-400">${payoutDetails.amount.toFixed(2)}</p>
          </div>

          <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border text-left`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Request Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Payment Method</span>
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{payoutDetails.method.name}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Status</span>
                <span className="text-amber-400 font-medium">Pending Review</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Submitted</span>
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              Your payout request will be reviewed by our admin team. You will be notified once it's processed. Processing typically takes 1-2 business days.
            </p>
          </div>

          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
          >
            <Home size={20} />
            Go to Dashboard
          </button>
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default PayoutSuccessPage;