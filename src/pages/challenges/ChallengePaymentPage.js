import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiUrl } from '../../utils/api';

const ChallengePaymentPage = ({ challenge, config, onBack, onSuccess }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [processing, setProcessing] = useState(false);
  const [paystackConfig, setPaystackConfig] = useState(null);

  useEffect(() => {
    fetchPaystackConfig();
  }, []);

  const fetchPaystackConfig = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/payment/config`);
      const data = await response.json();
      setPaystackConfig(data);
    } catch (error) {
      console.error('Error fetching payment config:', error);
    }
  };

  const handlePayment = async () => {
    if (!paystackConfig?.publicKey) {
      alert('Payment system not configured. Please contact support.');
      return;
    }

    setProcessing(true);
    try {
      // Initialize payment
      const response = await fetch(`${apiUrl()}/api/payment/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: config.totalPrice,
          challengeType: challenge.selectedType || '1-phase',
          accountSize: challenge.accountSize || challenge.name.split(' ')[0],
          callbackUrl: `${window.location.origin}/challenge-success`
        })
      });
      
      const paymentData = await response.json();
      
      if (!response.ok) {
        console.error('Payment initialization failed:', paymentData);
        alert(`Payment initialization failed: ${paymentData.message || 'Unknown error'}`);
        return;
      }
      
      if (paymentData.status && paymentData.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = paymentData.data.authorization_url;
      } else {
        alert('Payment initialization failed');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert('Payment initialization failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Payment</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Complete your challenge purchase</p>
        </div>
      </div>

      <GlassCard className="p-6 max-w-2xl mx-auto">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{challenge.name}</span>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{challenge.selectedType === '1-phase' ? challenge.phases[1].price : challenge.phases[2].price}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Leverage</span>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>{config.leverage}</span>
          </div>
          {config.addons.length > 0 && (
            <div className="space-y-2">
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add-ons:</p>
              {config.addons.map(addonId => {
                const addon = [
                  { id: 'resetProtection', name: 'Reset Protection', price: challenge.addOns?.resetProtection?.price || 49 },
                  { id: 'timeExtension', name: 'Time Extension', price: challenge.addOns?.timeExtension?.price || 29 },
                  { id: 'profitBoost', name: 'Profit Boost', price: challenge.addOns?.profitBoost?.price || 99 }
                ].find(a => a.id === addonId);
                return addon ? (
                  <div key={addonId} className="flex justify-between ml-4">
                    <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{addon.name}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{addon.price}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
          <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-3 flex justify-between font-bold`}>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Total</span>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{config.totalPrice}</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`}>💳 Secure Payment with Paystack</p>
            <p className={`text-xs ${isDark ? 'text-blue-400/70' : 'text-blue-600/70'}`}>Your payment is secured by Paystack. You can pay with cards, bank transfer, or USSD.</p>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={processing || !paystackConfig}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Processing...' : `Pay ${currency}${config.totalPrice} with Paystack`}
          </button>
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default ChallengePaymentPage;