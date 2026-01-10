import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '../../../components/UIComponents';
import SuccessNotification from '../../../components/SuccessNotification';
import AddLeverageModal from '../../../components/AddLeverageModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { apiUrl } from '../../../utils/api';

const EditChallengePlanPage = ({ planId, onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    accountSize: '',
    tier: 1,
    leverageOptions: ['1:30', '1:50', '1:100', '1:200'],
    addOns: {
      resetProtection: { price: 1, description: 'Reset your challenge once if you fail', enabled: true },
      timeExtension: { price: 1, description: 'Add 30 extra days to complete', enabled: true },
      profitBoost: { price: 1, description: 'Increase profit share by 5%', enabled: true }
    },
    phases: {
      1: {
        price: 60,
        profitSplit: 80,
        profitTarget: 20,
        maxDrawdown: 20
      },
      2: {
        price: 59,
        profitSplit: 85,
        profitTarget: 15,
        maxDrawdown: 25
      }
    }
  });

  useEffect(() => {
    fetchPlan();
  }, [planId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlan = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenge-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const plans = await response.json();
      const plan = plans.find(p => p._id === planId);
      
      if (plan) {
        setFormData({
          name: plan.name || '',
          accountSize: plan.accountSize || '',
          tier: plan.tier || 1,
          leverageOptions: plan.leverageOptions || ['1:30', '1:50', '1:100', '1:200'],
          addOns: plan.addOns || {
            resetProtection: { price: 1, description: 'Reset your challenge once if you fail', enabled: true },
            timeExtension: { price: 1, description: 'Add 30 extra days to complete', enabled: true },
            profitBoost: { price: 1, description: 'Increase profit share by 5%', enabled: true }
          },
          phases: plan.phases || {
            1: { price: 60, profitSplit: 80, profitTarget: 20, maxDrawdown: 20 },
            2: { price: 59, profitSplit: 85, profitTarget: 15, maxDrawdown: 25 }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhaseChange = (phase, field, value) => {
    setFormData(prev => ({
      ...prev,
      phases: {
        ...prev.phases,
        [phase]: {
          ...prev.phases[phase],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleAddOnChange = (addOn, field, value) => {
    setFormData(prev => ({
      ...prev,
      addOns: {
        ...prev.addOns,
        [addOn]: {
          ...prev.addOns[addOn],
          [field]: field === 'price' ? parseFloat(value) || 0 : value
        }
      }
    }));
  };

  const addNewAddOn = () => {
    const name = prompt('Enter addon name:');
    const description = prompt('Enter addon description:');
    if (name && description) {
      const key = name.toLowerCase().replace(/\s+/g, '');
      setFormData(prev => ({
        ...prev,
        addOns: {
          ...prev.addOns,
          [key]: { price: 0, description, enabled: true }
        }
      }));
    }
  };

  const removeAddOn = (addOnKey) => {
    setFormData(prev => {
      const newAddOns = { ...prev.addOns };
      delete newAddOns[addOnKey];
      return { ...prev, addOns: newAddOns };
    });
  };

  const addLeverageOption = (newOption) => {
    if (newOption && !formData.leverageOptions.includes(newOption)) {
      setFormData(prev => ({
        ...prev,
        leverageOptions: [...prev.leverageOptions, newOption]
      }));
    }
  };

  const removeLeverageOption = (option) => {
    setFormData(prev => ({
      ...prev,
      leverageOptions: prev.leverageOptions.filter(opt => opt !== option)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenge-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          accountSize: parseInt(formData.accountSize)
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => onBack(), 2000);
      } else {
        throw new Error('Failed to update challenge plan');
      }
    } catch (error) {
      console.error('Error updating challenge plan:', error);
      alert('Error updating challenge plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} size={20} />
        </button>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Challenge Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <GlassCard className="p-6">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Aura"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                  required
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Display name for the challenge</p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Account Size
                </label>
                <input
                  type="number"
                  value={formData.accountSize}
                  onChange={(e) => handleInputChange('accountSize', e.target.value)}
                  placeholder="10000"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                  required
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Starting balance in USD</p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Tier
                </label>
                <input
                  type="number"
                  value={formData.tier}
                  onChange={(e) => handleInputChange('tier', parseInt(e.target.value))}
                  min="1"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                  required
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Challenge difficulty level</p>
              </div>
            </div>
          </GlassCard>

          {/* Leverage Options */}
          <GlassCard className="p-6">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Leverage Options</h2>
            
            <div className="space-y-3">
              {formData.leverageOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`flex-1 p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {option}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLeverageOption(option)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => setShowLeverageModal(true)}
                className={`w-full p-2 border-2 border-dashed rounded-lg ${isDark ? 'border-white/20 text-white/60 hover:border-white/40' : 'border-gray-300 text-gray-600 hover:border-gray-400'} transition-colors`}
              >
                <Plus size={16} className="inline mr-2" />
                Add Leverage Option
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Add-ons */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add-ons</h2>
            <button
              type="button"
              onClick={addNewAddOn}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={16} className="inline mr-1" />
              Add New
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(formData.addOns).map(([key, addon]) => (
              <div key={key} className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addon.enabled}
                      onChange={(e) => handleAddOnChange(key, 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} capitalize`}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddOn(key)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>
                      Price ({currency})
                    </label>
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => handleAddOnChange(key, 'price', e.target.value)}
                      disabled={!addon.enabled}
                      className={`w-full p-2 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} border-none outline-none disabled:opacity-50`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${isDark ? 'text-white/70' : 'text-gray-600'} mb-1`}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={addon.description}
                      onChange={(e) => handleAddOnChange(key, 'description', e.target.value)}
                      disabled={!addon.enabled}
                      className={`w-full p-2 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} border-none outline-none disabled:opacity-50`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Challenge Phases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1-Phase Challenge */}
          <GlassCard className="p-6">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>1-Phase Challenge</h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Price ({currency})
                </label>
                <input
                  type="number"
                  value={formData.phases[1].price}
                  onChange={(e) => handlePhaseChange(1, 'price', e.target.value)}
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Profit Split (%)
                </label>
                <input
                  type="number"
                  value={formData.phases[1].profitSplit}
                  onChange={(e) => handlePhaseChange(1, 'profitSplit', e.target.value)}
                  min="0"
                  max="100"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Profit Target (%)
                </label>
                <input
                  type="number"
                  value={formData.phases[1].profitTarget}
                  onChange={(e) => handlePhaseChange(1, 'profitTarget', e.target.value)}
                  min="0"
                  max="100"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Max Drawdown (%)
                </label>
                <input
                  type="number"
                  value={formData.phases[1].maxDrawdown}
                  onChange={(e) => handlePhaseChange(1, 'maxDrawdown', e.target.value)}
                  min="0"
                  max="100"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
            </div>
          </GlassCard>

          {/* 2-Phase Challenge */}
          <GlassCard className="p-6">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>2-Phase Challenge</h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Price ({currency})
                </label>
                <input
                  type="number"
                  value={formData.phases[2].price}
                  onChange={(e) => handlePhaseChange(2, 'price', e.target.value)}
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Profit Split (%)
                </label>
                <input
                  type="number"
                  value={formData.phases[2].profitSplit}
                  onChange={(e) => handlePhaseChange(2, 'profitSplit', e.target.value)}
                  min="0"
                  max="100"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Profit Target (%)
                </label>
                <input
                  type="number"
                  value={formData.phases[2].profitTarget}
                  onChange={(e) => handlePhaseChange(2, 'profitTarget', e.target.value)}
                  min="0"
                  max="100"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Max Drawdown (%)
                </label>
                <input
                  type="number"
                  value={formData.phases[2].maxDrawdown}
                  onChange={(e) => handlePhaseChange(2, 'maxDrawdown', e.target.value)}
                  min="0"
                  max="100"
                  className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onBack}
            className={`px-6 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Plan'}
          </button>
        </div>
      </form>

      <SuccessNotification 
        message="Challenge plan updated successfully!"
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <AddLeverageModal
        show={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        onAdd={addLeverageOption}
      />
    </div>
  );
};

export default EditChallengePlanPage;