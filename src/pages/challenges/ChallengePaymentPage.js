import { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const ChallengePaymentPage = ({ challenge, config, onBack, onSuccess }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`${apiUrl()}/api/user/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeType: challenge.phases && Object.keys(challenge.phases).length === 1 ? '1-phase' : '2-phase',
          accountSize: challenge.accountSize || challenge.name.split(' ')[0],
          amount: config.totalPrice
        })
      });
      
      if (response.ok) {
        // Update user account balance
        await fetch(`${apiUrl()}/api/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            accountBalance: challenge.accountSize || 10000
          })
        });
        onSuccess(challenge);
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Payment Method</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-500/10'
                  : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')
              }`}
            >
              <CreditCard className={paymentMethod === 'card' ? 'text-blue-400' : (isDark ? 'text-white/60' : 'text-gray-600')} />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Credit/Debit Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                paymentMethod === 'crypto'
                  ? 'border-blue-500 bg-blue-500/10'
                  : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')
              }`}
            >
              <Wallet className={paymentMethod === 'crypto' ? 'text-blue-400' : (isDark ? 'text-white/60' : 'text-gray-600')} />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cryptocurrency</span>
            </button>
          </div>

          {paymentMethod === 'card' && (
            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Card Number"
                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500`}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500`}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500`}
                />
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{challenge.name}</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>${challenge.phases[1].price}</span>
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
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>${addon.price}</span>
                    </div>
                  ) : null;
                })}}
              </div>
            )}
            <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-3 flex justify-between font-bold`}>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>Total</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>${config.totalPrice}</span>
            </div>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full mt-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Processing...' : `Pay $${config.totalPrice}`}
          </button>
        </GlassCard>
      </div>

      <Footer />
    </div>
  );
};

export default ChallengePaymentPage;