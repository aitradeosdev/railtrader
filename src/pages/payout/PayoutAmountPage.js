import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, DollarSign, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiUrl } from '../../utils/api';

const PayoutAmountPage = ({ selectedMethod, availableBalance, onBack, onConfirm }) => {
  const { isDark } = useTheme();
  const { token, refreshUser } = useAuth();
  const { currency } = useCurrency();
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // Real-time data refresh
  const refreshData = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    // Initial refresh
    refreshData();

    // Set up interval for periodic refresh (every 30 seconds)
    const interval = setInterval(refreshData, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  const minPayout = selectedMethod.type === 'crypto' ? 100 : 500;
  const fee = selectedMethod.type === 'crypto' ? 25 : 15;
  const netAmount = amount ? parseFloat(amount) - fee : 0;

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const handleMaxClick = () => {
    setAmount(availableBalance.toString());
  };

  const handleConfirm = async () => {
    if (parseFloat(amount) >= minPayout && parseFloat(amount) <= availableBalance) {
      setProcessing(true);
      try {
        const response = await fetch(apiUrl('/user/payout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            paymentMethod: selectedMethod.name,
            paymentDetails: selectedMethod.type === 'crypto' ? selectedMethod.walletAddress : `${selectedMethod.bankName} - ${selectedMethod.accountNumber}`
          })
        });
        
        if (response.ok) {
          onConfirm({
            method: selectedMethod,
            amount: parseFloat(amount),
            fee,
            netAmount
          });
        }
      } catch (error) {
        console.error('Error submitting payout:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const isValidAmount = amount && parseFloat(amount) >= minPayout && parseFloat(amount) <= availableBalance;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Withdraw Funds</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Enter withdrawal amount</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Withdrawal Amount</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className={`w-full pl-12 pr-20 py-4 text-2xl font-bold rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500`}
              />
              <button
                onClick={handleMaxClick}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg"
              >
                MAX
              </button>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Available Balance</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{availableBalance.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Minimum Withdrawal</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{minPayout}</span>
            </div>
          </div>

          {amount && parseFloat(amount) < minPayout && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <AlertCircle className="text-amber-400" size={16} />
              <span className="text-amber-400 text-sm">Minimum withdrawal is {currency}{minPayout}</span>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Withdrawal Summary</h2>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-1`}>Destination</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedMethod.name}</p>
              {selectedMethod.type === 'crypto' && (
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'} font-mono mt-1`}>{selectedMethod.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Withdrawal Amount</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{amount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Processing Fee</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>-{currency}{fee}</span>
              </div>
              <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-2 flex justify-between font-bold`}>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Net Amount</span>
                <span className="text-emerald-400">{currency}{netAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!isValidAmount || processing}
            className={`w-full mt-6 py-4 rounded-2xl font-bold transition-all ${
              isValidAmount && !processing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : (isDark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400')
            }`}
          >
            {processing ? 'Processing...' : 'Confirm Withdrawal'}
          </button>
        </GlassCard>
      </div>

      <Footer />
    </div>
  );
};

export default PayoutAmountPage;