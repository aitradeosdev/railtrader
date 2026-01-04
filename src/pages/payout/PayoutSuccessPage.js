import { CheckCircle, Home, FileText } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const PayoutSuccessPage = ({ payoutDetails, onGoHome }) => {
  const { isDark } = useTheme();

  const estimatedTime = payoutDetails.method.type === 'crypto' ? '10-30 minutes' : '1-3 business days';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>
        </div>
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter mb-4`}>
          Withdrawal Submitted!
        </h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-lg`}>
          Your withdrawal request has been processed successfully.
        </p>
      </div>

      <GlassCard className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Amount</h3>
              <p className="text-2xl font-black text-emerald-400">${payoutDetails.netAmount.toFixed(2)}</p>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mt-1`}>
                (${payoutDetails.amount} - ${payoutDetails.fee} fee)
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Estimated Time</h3>
              <p className="text-2xl font-black text-blue-400">{estimatedTime}</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border text-left`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Withdrawal Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Destination</span>
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{payoutDetails.method.name}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Method</span>
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium capitalize`}>{payoutDetails.method.type}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Transaction ID</span>
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-mono text-sm`}>TXN-{Date.now().toString().slice(-8)}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              You will receive an email confirmation shortly. You can track the status of your withdrawal in your account dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onGoHome}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
            >
              <Home size={20} />
              Go to Dashboard
            </button>
            <button className={`flex-1 flex items-center justify-center gap-2 py-4 ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} font-bold rounded-2xl transition-colors`}>
              <FileText size={20} />
              View Receipt
            </button>
          </div>
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default PayoutSuccessPage;