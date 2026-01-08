import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wallet, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const PaymentMethodsPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('bank');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({ type: 'bank', name: '', accountName: '', bankName: '', accountNumber: '', walletAddress: '' });

  useEffect(() => {
    setPaymentMethods(user?.paymentMethods || []);
  }, [user]);

  const handleAddMethod = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMethod)
      });
      
      if (response.ok) {
        setPaymentMethods([...paymentMethods, { ...newMethod, _id: Date.now() }]);
        setNewMethod({ type: 'bank', name: '', accountName: '', bankName: '', accountNumber: '', walletAddress: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const handleDeleteMethod = async (methodId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setPaymentMethods(paymentMethods.filter(method => method._id !== methodId));
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
                setNewMethod({ type: 'bank', name: '', accountName: '', bankName: '', accountNumber: '', walletAddress: '' });
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium"
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
              <input
                type="text"
                placeholder="Account holder name"
                value={newMethod.accountName}
                onChange={(e) => setNewMethod(prev => ({ ...prev, accountName: e.target.value }))}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} mb-3`}
              />
              <input
                type="text"
                placeholder="Bank name"
                value={newMethod.bankName}
                onChange={(e) => setNewMethod(prev => ({ ...prev, bankName: e.target.value }))}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} mb-3`}
              />
              <input
                type="text"
                placeholder="Account number"
                value={newMethod.accountNumber}
                onChange={(e) => setNewMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
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
                setNewMethod({ type: 'crypto', name: '', accountName: '', bankName: '', accountNumber: '', walletAddress: '' });
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium"
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