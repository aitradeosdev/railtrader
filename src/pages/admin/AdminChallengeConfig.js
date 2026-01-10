import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminChallengeConfig = () => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    accountSize: 10000,
    tier: 1,
    phases: {
      1: { price: 99, profitSplit: 80, maxDrawdown: 25, profitTarget: 20 },
      2: { price: 149, profitSplit: 85, maxDrawdown: 20, profitTarget: 15 }
    },
    leverageOptions: ['1:30', '1:50', '1:100', '1:200'],
    addOns: {
      resetProtection: { price: 49, description: 'Reset your challenge once if you fail' },
      timeExtension: { price: 29, description: 'Add 30 extra days to complete' },
      profitBoost: { price: 99, description: 'Increase profit share by 5%' }
    }
  });

  useEffect(() => {
    fetchPlans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/challenge-plans', {
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

  const handleSave = async () => {
    try {
      const url = editingPlan 
        ? `http://localhost:5000/api/admin/challenge-plans/${editingPlan._id}`
        : 'http://localhost:5000/api/admin/challenge-plans';
      
      const response = await fetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchPlans();
        setShowModal(false);
        setEditingPlan(null);
        setFormData({
          name: '',
          accountSize: 10000,
          tier: 1,
          phases: {
            1: { price: 99, profitSplit: 80, maxDrawdown: 25, profitTarget: 20 },
            2: { price: 149, profitSplit: 85, maxDrawdown: 20, profitTarget: 15 }
          },
          leverageOptions: ['1:30', '1:50', '1:100', '1:200'],
          addOns: {
            resetProtection: { price: 49, description: 'Reset your challenge once if you fail' },
            timeExtension: { price: 29, description: 'Add 30 extra days to complete' },
            profitBoost: { price: 99, description: 'Increase profit share by 5%' }
          }
        });
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/challenge-plans/${planId}`, {
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
          onClick={() => setShowModal(true)}
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
                <span className={isDark ? 'text-white' : 'text-gray-900'}>${plan.accountSize.toLocaleString()}</span>
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
                    <span>${plan.phases[1].price}</span>
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
                    <span>${plan.phases[2].price}</span>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              {editingPlan ? 'Edit' : 'Add'} Challenge Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                    placeholder="e.g., Aura"
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Display name for the challenge</p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Account Size
                  </label>
                  <input
                    type="number"
                    value={formData.accountSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountSize: parseInt(e.target.value) }))}
                    className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                    placeholder="10000"
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Starting balance in USD</p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Tier
                  </label>
                  <input
                    type="number"
                    value={formData.tier}
                    onChange={(e) => setFormData(prev => ({ ...prev, tier: parseInt(e.target.value) }))}
                    className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                    placeholder="1"
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Challenge difficulty level</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Leverage Options</h4>
                  <div className="space-y-2">
                    {['1:30', '1:50', '1:100', '1:200'].map(leverage => (
                      <label key={leverage} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.leverageOptions.includes(leverage)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                leverageOptions: [...prev.leverageOptions, leverage]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                leverageOptions: prev.leverageOptions.filter(l => l !== leverage)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{leverage}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Add-ons</h4>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Reset Protection Price ($)</label>
                      <input
                        type="number"
                        value={formData.addOns.resetProtection.price}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          addOns: {
                            ...prev.addOns,
                            resetProtection: { ...prev.addOns.resetProtection, price: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Time Extension Price ($)</label>
                      <input
                        type="number"
                        value={formData.addOns.timeExtension.price}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          addOns: {
                            ...prev.addOns,
                            timeExtension: { ...prev.addOns.timeExtension, price: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Profit Boost Price ($)</label>
                      <input
                        type="number"
                        value={formData.addOns.profitBoost.price}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          addOns: {
                            ...prev.addOns,
                            profitBoost: { ...prev.addOns.profitBoost, price: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>1-Phase Challenge</h4>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Price ($)</label>
                      <input
                        type="number"
                        placeholder="99"
                        value={formData.phases[1].price}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            1: { ...prev.phases[1], price: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Profit Split (%)</label>
                      <input
                        type="number"
                        placeholder="80"
                        value={formData.phases[1].profitSplit}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            1: { ...prev.phases[1], profitSplit: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Profit Target (%)</label>
                      <input
                        type="number"
                        placeholder="20"
                        value={formData.phases[1].profitTarget}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            1: { ...prev.phases[1], profitTarget: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Max Drawdown (%)</label>
                      <input
                        type="number"
                        placeholder="25"
                        value={formData.phases[1].maxDrawdown}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            1: { ...prev.phases[1], maxDrawdown: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>2-Phase Challenge</h4>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Price ($)</label>
                      <input
                        type="number"
                        placeholder="149"
                        value={formData.phases[2].price}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            2: { ...prev.phases[2], price: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Profit Split (%)</label>
                      <input
                        type="number"
                        placeholder="85"
                        value={formData.phases[2].profitSplit}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            2: { ...prev.phases[2], profitSplit: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Profit Target (%)</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={formData.phases[2].profitTarget}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            2: { ...prev.phases[2], profitTarget: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>Max Drawdown (%)</label>
                      <input
                        type="number"
                        placeholder="20"
                        value={formData.phases[2].maxDrawdown}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: {
                            ...prev.phases,
                            2: { ...prev.phases[2], maxDrawdown: parseInt(e.target.value) }
                          }
                        }))}
                        className={`w-full p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none text-sm`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPlan(null);
                }}
                className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                {editingPlan ? 'Update' : 'Create'} Plan
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminChallengeConfig;