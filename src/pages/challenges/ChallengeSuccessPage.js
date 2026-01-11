import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Loader, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const ChallengeSuccessPage = ({ challenge, onGoHome }) => {
  const { isDark } = useTheme();
  const { currency } = useCurrency();
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('checking');
  const [challengeData, setChallengeData] = useState(challenge);

  const verifyPayment = useCallback(async (reference) => {
    try {
      const response = await fetch(`${apiUrl()}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reference })
      });

      const data = await response.json();

      if (data.success) {
        setChallengeData(data.challenge);
        setVerificationStatus('verified');
        setSearchParams({});
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
    }
  }, [token, setSearchParams]);

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference && !challengeData) {
      verifyPayment(reference);
    } else if (challengeData) {
      setVerificationStatus('verified');
    }
  }, [searchParams, challengeData, verifyPayment]);

  if (verificationStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md w-full text-center">
          <Loader className="mx-auto mb-4 animate-spin text-blue-500" size={48} />
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Verifying Payment
          </h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Please wait while we confirm your payment...
          </p>
        </GlassCard>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Payment Verification Failed
          </h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>
            We couldn't verify your payment. Please contact support.
          </p>
          <button
            onClick={onGoHome}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </GlassCard>
      </div>
    );
  }

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
          Your {challengeData?.challengeType || 'trading'} challenge is now active and ready to trade.
        </p>
      </div>

      <GlassCard className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Account Balance</h3>
              <p className="text-2xl font-black text-blue-400">{currency}{challengeData?.accountSize?.toLocaleString() || '10,000'}</p>
            </div>
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Profit Target</h3>
              <p className="text-2xl font-black text-emerald-400">{challengeData?.phases?.[challengeData?.selectedType === '1-phase' ? 1 : 2]?.profitTarget || challengeData?.phases?.[1]?.profitTarget || 20}%</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Next Steps</h3>
            <div className={`text-left space-y-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              <p>• Review the challenge rules and guidelines</p>
              <p>• Start trading to reach your profit target</p>
              <p>• Monitor your progress in the dashboard</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 py-4 px-8 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
            >
              <Home size={20} />
              Go to Dashboard
            </button>
          </div>
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default ChallengeSuccessPage;