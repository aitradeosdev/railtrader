import { useState, useEffect } from 'react';
import { Wallet, User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiUrl } from '../../utils/api';

const AdminPayoutsPage = () => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPayouts = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/payouts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPayouts(data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (payoutId, status) => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/payouts/${payoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNotes })
      });
      
      if (response.ok) {
        fetchPayouts();
        setShowModal(false);
        setSelectedPayout(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating payout:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-400';
      case 'approved': return 'text-emerald-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Payout Management</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Review and process payout requests</p>
      </div>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Payout Requests</h2>
        
        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No Payout Requests</h3>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>No payout requests have been submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map(payout => (
              <div key={payout._id} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center`}>
                    <User className={isDark ? 'text-white' : 'text-gray-600'} size={20} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {payout.userId.firstName} {payout.userId.lastName}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{payout.userId.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-xs ${getStatusColor(payout.status)} flex items-center gap-1`}>
                        {getStatusIcon(payout.status)}
                        {payout.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currency}{payout.amount.toLocaleString()}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    {payout.paymentMethod}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedPayout(payout);
                      setShowModal(true);
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Eye size={12} />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Review Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Payout Request Review
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>User Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Name:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedPayout.userId.firstName} {selectedPayout.userId.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Email:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedPayout.userId.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Balance:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {currency}{selectedPayout.userId.accountBalance?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>MT5 Server:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedPayout.mt5Data?.server || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>MT5 Login:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedPayout.mt5Data?.login || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>MT5 Password:</span>
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-mono`}>{selectedPayout.mt5Data?.password || 'Not assigned'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Payout Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Amount:</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currency}{selectedPayout.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Method:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedPayout.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Details:</span>
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-mono text-xs`}>
                      {selectedPayout.paymentDetails}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Requested:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {new Date(selectedPayout.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                rows={3}
                placeholder="Add notes about this payout request..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayout(null);
                  setAdminNotes('');
                }}
                className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedPayout._id, 'rejected')}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedPayout._id, 'approved')}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Approve
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutsPage;