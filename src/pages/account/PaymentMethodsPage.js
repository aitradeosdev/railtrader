import { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const PaymentMethodsPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('bank');

  const bankAccounts = [
    { id: 1, type: 'bank', name: 'Chase Bank ****1234', routing: 'ACH', default: true },
    { id: 2, type: 'bank', name: 'Wells Fargo ****5678', routing: 'Wire', default: false }
  ];

  const cryptoWallets = [
    { id: 1, type: 'btc', name: 'Bitcoin Wallet', address: '1A1zP1...', default: true },
    { id: 2, type: 'eth', name: 'Ethereum Wallet', address: '0x742d...', default: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Payout Methods</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Manage your payout methods</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'bank'
              ? 'bg-blue-600 text-white'
              : (isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600')
          }`}
        >
          Bank
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'crypto'
              ? 'bg-blue-600 text-white'
              : (isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600')
          }`}
        >
          Crypto
        </button>
      </div>

      {activeTab === 'bank' && (
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Bank Accounts</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium">
              <Plus size={16} />
              Add Bank Account
            </button>
          </div>
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <CreditCard className={isDark ? 'text-white/60' : 'text-gray-600'} size={24} />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{account.name}</p>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{account.routing}</p>
                  </div>
                  {account.default && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg">Default</span>
                  )}
                </div>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}>
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'crypto' && (
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Crypto Wallets</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium">
              <Plus size={16} />
              Add Wallet
            </button>
          </div>
          <div className="space-y-4">
            {cryptoWallets.map((wallet) => (
              <div key={wallet.id} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <Wallet className={isDark ? 'text-white/60' : 'text-gray-600'} size={24} />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{wallet.name}</p>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} font-mono`}>{wallet.address}</p>
                  </div>
                  {wallet.default && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg">Default</span>
                  )}
                </div>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}>
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <Footer />
    </div>
  );
};

export default PaymentMethodsPage;