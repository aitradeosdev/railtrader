import { useState } from 'react';
import { CreditCard, Wallet, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const PayoutMainPage = ({ onSelectMethod }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Get saved payment methods from user data
  const savedMethods = user?.paymentMethods || [];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      onSelectMethod(selectedMethod, user.accountBalance);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Liquid Payouts</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Withdraw your trading profits</p>
      </div>

      <GlassCard className="p-6 md:p-8">
        <div className="text-center mb-8">
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm mb-2`}>Available Balance</p>
          <div className="text-4xl md:text-6xl font-black text-emerald-400">${user.accountBalance.toLocaleString()}</div>
        </div>

        <div className="space-y-6">
          {savedMethods.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No Payment Methods</h3>
              <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Add payment methods in Account Settings to request payouts</p>
            </div>
          ) : (
            <>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Select Payment Method</h3>
              <div className="space-y-3">
                {savedMethods.map((method) => (
                  <button
                    key={method._id}
                    onClick={() => handleMethodSelect(method)}
                    className={`w-full p-4 rounded-2xl border transition-all text-left ${
                      selectedMethod?._id === method._id
                        ? 'border-blue-500 bg-blue-500/10'
                        : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {method.type === 'bank' ? 
                        <CreditCard className={selectedMethod?._id === method._id ? 'text-blue-400' : (isDark ? 'text-white/60' : 'text-gray-600')} size={24} /> :
                        <Wallet className={selectedMethod?._id === method._id ? 'text-blue-400' : (isDark ? 'text-white/60' : 'text-gray-600')} size={24} />
                      }
                      <div className="flex-1">
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{method.name}</p>
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} font-mono`}>
                          {method.type === 'bank' ? `${method.bankName} - ${method.accountName}` : method.walletAddress}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
            selectedMethod
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : (isDark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400')
          }`}
        >
          Continue
          <ArrowRight size={20} />
        </button>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default PayoutMainPage;
