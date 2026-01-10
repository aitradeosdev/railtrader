import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '../../../components/UIComponents';
import SuccessNotification from '../../../components/SuccessNotification';
import AddLeverageModal from '../../../components/AddLeverageModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { apiUrl } from '../../../utils/api';

const AddChallengePlanPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    accountSize: '',
    tier: 1,
    leverageOptions: ['1:30', '1:50', '1:100', '1:200'],
    addOns: {
      resetProtection: { price: 1, description: 'Reset your challenge once if you fail' },
      timeExtension: { price: 1, description: 'Add 30 extra days to complete' },
      profitBoost: { price: 1, description: 'Increase profit share by 5%' }
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
      const response = await fetch(`${apiUrl()}/api/admin/challenge-plans`, {
        method: 'POST',
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
        throw new Error('Failed to create challenge plan');
      }
    } catch (error) {
      console.error('Error creating challenge plan:', error);
      alert('Error creating challenge plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} size={20} />
        </button>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Challenge Plan</h1>
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
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add-ons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Reset Protection Price ({currency})
              </label>
              <input
                type="number"
                value={formData.addOns.resetProtection.price}
                onChange={(e) => handleAddOnChange('resetProtection', 'price', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Time Extension Price ({currency})
              </label>
              <input
                type="number"
                value={formData.addOns.timeExtension.price}
                onChange={(e) => handleAddOnChange('timeExtension', 'price', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Profit Boost Price ({currency})
              </label>
              <input
                type="number"
                value={formData.addOns.profitBoost.price}
                onChange={(e) => handleAddOnChange('profitBoost', 'price', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>
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
            {saving ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>

      <SuccessNotification 
        message="Challenge plan created successfully!"
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

export default AddChallengePlanPage;