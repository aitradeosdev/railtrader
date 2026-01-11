import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const PaymentCallbackPage = ({ onComplete }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [message, setMessage] = useState('Verifying your payment...');

  const verifyPayment = useCallback(async () => {
    // Small delay to ensure URL parameters are fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

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
        setStatus('success');
        setMessage('Payment successful! Your challenge has been activated.');
        
        // Clear URL parameters
        setSearchParams({});
        
        setTimeout(() => {
          if (onComplete) {
            onComplete('success', data.challenge);
          } else {
            navigate('/challenges', { replace: true });
          }
        }, 3000);
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Payment verification failed. Please contact support.');
    }
  }, [searchParams, token, navigate, onComplete, setSearchParams]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader className="mx-auto mb-4 animate-spin text-blue-500" size={48} />
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Verifying Payment
            </h1>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment Successful!
            </h1>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>
              {message}
            </p>
            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              Redirecting to your challenges...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment Failed
            </h1>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>
              {message}
            </p>
            <button
              onClick={() => {
                if (onComplete) {
                  onComplete('dashboard');
                } else {
                  navigate('/challenges', { replace: true });
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Challenges
            </button>
          </>
        )}
      </GlassCard>
    </div>
  );
};

export default PaymentCallbackPage;