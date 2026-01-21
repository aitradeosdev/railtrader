import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CreditCard, Wallet, Plus, Trash2, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const PaymentMethodsPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token, user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bank');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({ type: 'bank', name: '', accountName: '', bankName: '', bankCode: '', accountNumber: '', walletAddress: '' });
  const [banks, setBanks] = useState([]);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionError, setResolutionError] = useState('');

  // Real-time data refresh
  const refreshData = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    setPaymentMethods(user?.paymentMethods || []);
    fetchBanks();
  }, [user]);

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

  const fetchBanks = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/payment/banks`);
      if (response.ok) {
        const data = await response.json();
        setBanks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const resolveAccount = async (accountNumber, bankCode) => {
    if (!accountNumber || !bankCode || accountNumber.length < 10) return;
    
    setIsResolving(true);
    setResolutionError('');
    
    try {
      const response = await fetch(`${apiUrl()}/api/payment/resolve-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          setNewMethod(prev => ({ ...prev, accountName: data.data.account_name }));
        }
      } else {
        if (response.status === 429) {
          setResolutionError('Daily verification limit reached. Please enter account name manually.');
        } else {
          setResolutionError('Invalid account details');
        }
      }
    } catch (error) {
      setResolutionError('Daily verification limit reached. Please enter account name manually.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleAddMethod = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/user/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMethod)
      });
      
      if (response.ok) {
        // Refresh user data to get updated payment methods
        await refreshData();
        
        setNewMethod({ type: 'bank', name: '', accountName: '', bankName: '', bankCode: '', accountNumber: '', walletAddress: '' });
        setShowAddForm(false);
        setResolutionError('');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const handleDeleteMethod = async (methodId) => {
    try {
      const response = await fetch(`${apiUrl()}/api/user/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Refresh user data to get updated payment methods
        await refreshData();
      } else {
        console.error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const filteredMethods = paymentMethods.filter(method => method.type === activeTab);

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

      {user?.isSuspended && (
        <GlassCard className="p-6 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Suspended</h3>
          </div>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-sm`}>
            You cannot add or modify payout methods while your account is suspended. Please contact support for assistance.
          </p>
        </GlassCard>
      )}

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
            <button 
              onClick={() => {
                setNewMethod({ type: 'bank', name: '', accountName: '', bankName: '', bankCode: '', accountNumber: '', walletAddress: '' });
                setShowAddForm(true);
                setResolutionError('');
              }}
              disabled={user?.isSuspended}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                user?.isSuspended 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white'
              }`}
            >
              <Plus size={16} />
              Add Bank Account
            </button>
          </div>
          
          {showAddForm && newMethod.type === 'bank' && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} mb-4`}>
              <input
                type="text"
                placeholder="Method name (e.g., My Chase Account)"
                value={newMethod.name}
                onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} mb-3`}
              />
              
              <select
                value={newMethod.bankCode}
                onChange={(e) => {
                  const selectedBank = banks.find(bank => bank.code === e.target.value);
                  setNewMethod(prev => ({ 
                    ...prev, 
                    bankCode: e.target.value,
                    bankName: selectedBank?.name || '',
                    accountName: '' // Reset account name when bank changes
                  }));
                  setResolutionError('');
                }}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} mb-3`}
              >
                <option value="">Select Bank</option>
                {banks.map((bank, index) => (
                  <option key={`${bank.code}-${index}`} value={bank.code}>{bank.name}</option>
                ))}
              </select>
              
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Account number"
                  value={newMethod.accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    setNewMethod(prev => ({ ...prev, accountNumber: value, accountName: '' }));
                    setResolutionError('');
                    
                    // Auto-resolve when account number is 10 digits
                    if (value.length === 10 && newMethod.bankCode) {
                      resolveAccount(value, newMethod.bankCode);
                    }
                  }}
                  maxLength="10"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'}`}
                />
                {isResolving && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                  </div>
                )}
              </div>
              
              <input
                type="text"
                placeholder="Account holder name"
                value={newMethod.accountName}
                onChange={(e) => setNewMethod(prev => ({ ...prev, accountName: e.target.value }))}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} mb-3 ${newMethod.accountName && !isResolving ? 'border-2 border-green-500' : ''} ${newMethod.accountName && resolutionError.includes('Daily') ? '' : newMethod.accountName ? 'bg-gray-100 text-gray-600' : ''}`}
                readOnly={newMethod.accountName && !resolutionError.includes('Daily') ? true : isResolving}
              />
              
              {resolutionError && (
                <p className="text-red-400 text-sm mb-3">{resolutionError}</p>
              )}
              
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>Cancel</button>
                <button 
                  onClick={handleAddMethod} 
                  disabled={!newMethod.name || !newMethod.bankCode || !newMethod.accountNumber || !newMethod.accountName || isResolving}
                  className={`px-4 py-2 rounded-xl ${!newMethod.name || !newMethod.bankCode || !newMethod.accountNumber || !newMethod.accountName || isResolving ? 'bg-gray-400 text-gray-600' : 'bg-blue-600 text-white'}`}
                >
                  Add
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {filteredMethods.map((method) => (
              <div key={method._id} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <CreditCard className={isDark ? 'text-white/60' : 'text-gray-600'} size={24} />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{method.name}</p>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{method.bankName} - {method.accountName}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteMethod(method._id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}>
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
            <button 
              onClick={() => {
                setNewMethod({ type: 'crypto', name: '', accountName: '', bankName: '', bankCode: '', accountNumber: '', walletAddress: '' });
                setShowAddForm(true);
                setResolutionError('');
              }}
              disabled={user?.isSuspended}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                user?.isSuspended 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white'
              }`}
            >
              <Plus size={16} />
              Add Wallet
            </button>
          </div>
          
          {showAddForm && newMethod.type === 'crypto' && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} mb-4`}>
              <input
                type="text"
                placeholder="Wallet name (e.g., My Bitcoin Wallet)"
                value={newMethod.name}
                onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} mb-3`}
              />
              <input
                type="text"
                placeholder="Wallet address"
                value={newMethod.walletAddress}
                onChange={(e) => setNewMethod(prev => ({ ...prev, walletAddress: e.target.value }))}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} mb-3`}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>Cancel</button>
                <button onClick={handleAddMethod} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Add</button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {filteredMethods.map((method) => (
              <div key={method._id} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <Wallet className={isDark ? 'text-white/60' : 'text-gray-600'} size={24} />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{method.name}</p>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} font-mono`}>{method.walletAddress}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteMethod(method._id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}>
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