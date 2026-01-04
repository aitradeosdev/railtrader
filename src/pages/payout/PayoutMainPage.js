import { useState } from 'react';
import { CreditCard, Wallet, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const PayoutMainPage = ({ onSelectMethod }) => {
  const { isDark } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Mock data - in real app this would come from user's saved payout methods
  const bankAccounts = [
    { id: 1, type: 'bank', name: 'Chase Bank ****1234', routing: 'ACH', default: true },
    { id: 2, type: 'bank', name: 'Wells Fargo ****5678', routing: 'Wire', default: false }
  ];

  const cryptoWallets = [
    { id: 1, type: 'crypto', name: 'Bitcoin Wallet', address: '1A1zP1...', currency: 'BTC', default: true },
    { id: 2, type: 'crypto', name: 'Ethereum Wallet', address: '0x742d...', currency: 'ETH', default: false }
  ];

  const availableBalance = 12450;

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      onSelectMethod(selectedMethod, availableBalance);
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
          <div className="text-4xl md:text-6xl font-black text-emerald-400">${availableBalance.toLocaleString()}</div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Bank Accounts</h3>
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleMethodSelect(account)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left ${
                    selectedMethod?.id === account.id && selectedMethod?.type === account.type
                      ? 'border-blue-500 bg-blue-500/10'
                      : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className={selectedMethod?.id === account.id && selectedMethod?.type === account.type ? 'text-blue-400' : (isDark ? 'text-white/60' : 'text-gray-600')} size={24} />
                    <div className="flex-1">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{account.name}</p>
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{account.routing}</p>
                    </div>
                    {account.default && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg">Default</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Crypto Wallets</h3>
            <div className="space-y-3">
              {cryptoWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleMethodSelect(wallet)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left ${
                    selectedMethod?.id === wallet.id && selectedMethod?.type === wallet.type
                      ? 'border-blue-500 bg-blue-500/10'
                      : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Wallet className={selectedMethod?.id === wallet.id && selectedMethod?.type === wallet.type ? 'text-blue-400' : (isDark ? 'text-white/60' : 'text-gray-600')} size={24} />
                    <div className="flex-1">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{wallet.name}</p>
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} font-mono`}>{wallet.address}</p>
                    </div>
                    {wallet.default && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg">Default</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
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