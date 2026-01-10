import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiUrl } from '../../utils/api';
import AddChallengePlanPage from './challenges/AddChallengePlanPage';
import EditChallengePlanPage from './challenges/EditChallengePlanPage';

const AdminChallengeConfig = () => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
  const [editingPlanId, setEditingPlanId] = useState(null);


  useEffect(() => {
    fetchPlans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenge-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = (plan) => {
    setEditingPlanId(plan._id);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingPlanId(null);
    fetchPlans(); // Refresh the list
  };

  // Show different views based on current state
  if (currentView === 'add') {
    return <AddChallengePlanPage onBack={handleBackToList} />;
  }

  if (currentView === 'edit' && editingPlanId) {
    return <EditChallengePlanPage planId={editingPlanId} onBack={handleBackToList} />;
  }

  const handleDelete = async (planId) => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenge-plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchPlans();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
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
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Challenge Configuration</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Configure challenge plans and pricing</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setCurrentView('add')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Challenge Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <GlassCard key={plan._id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Edit size={16} className={isDark ? 'text-white/60' : 'text-gray-600'} />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Account Size:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{currency}{plan.accountSize.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Tier:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{plan.tier}</span>
              </div>
              
              <div className="mt-4">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>1-Phase</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>{currency}{plan.phases[1].price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Split:</span>
                    <span>{plan.phases[1].profitSplit}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span>{plan.phases[1].profitTarget}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drawdown:</span>
                    <span>{plan.phases[1].maxDrawdown}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>2-Phase</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>{currency}{plan.phases[2].price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Split:</span>
                    <span>{plan.phases[2].profitSplit}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span>{plan.phases[2].profitTarget}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drawdown:</span>
                    <span>{plan.phases[2].maxDrawdown}%</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
  );
};

export default AdminChallengeConfig;