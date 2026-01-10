import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const ChallengeConfigPage = ({ challenge, onBack, onContinue }) => {
  const { isDark } = useTheme();
  const [selectedLeverage, setSelectedLeverage] = useState(challenge.leverageOptions?.[0] || '1:100');
  const [selectedAddons, setSelectedAddons] = useState([]);

  const leverageOptions = challenge.leverageOptions || ['1:30', '1:50', '1:100', '1:200'];
  const addons = [
    { 
      id: 'resetProtection', 
      name: 'Reset Protection', 
      price: challenge.addOns?.resetProtection?.price || 49, 
      description: challenge.addOns?.resetProtection?.description || 'Reset your challenge once if you fail' 
    },
    { 
      id: 'timeExtension', 
      name: 'Time Extension', 
      price: challenge.addOns?.timeExtension?.price || 29, 
      description: challenge.addOns?.timeExtension?.description || 'Add 30 extra days to complete' 
    },
    { 
      id: 'profitBoost', 
      name: 'Profit Boost', 
      price: challenge.addOns?.profitBoost?.price || 99, 
      description: challenge.addOns?.profitBoost?.description || 'Increase profit share by 5%' 
    }
  ];

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const totalPrice = challenge.phases[1].price + selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Configure {challenge.name}</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Customize your trading parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Leverage</h2>
          <div className="grid grid-cols-2 gap-3">
            {leverageOptions.map(leverage => (
              <button
                key={leverage}
                onClick={() => setSelectedLeverage(leverage)}
                className={`p-3 rounded-xl border transition-all ${
                  selectedLeverage === leverage 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')
                }`}
              >
                <span className={`font-semibold ${selectedLeverage === leverage ? 'text-blue-400' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                  {leverage}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Add-ons</h2>
          <div className="space-y-3">
            {addons.map(addon => (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAddons.includes(addon.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : (isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50')
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{addon.name}</h3>
                      <span className="text-blue-400 font-bold">${addon.price}</span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mt-1`}>{addon.description}</p>
                  </div>
                  {selectedAddons.includes(addon.id) && <Check className="text-blue-400" size={20} />}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>
          <div className="text-right">
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${totalPrice}</p>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total</p>
          </div>
        </div>
        <button
          onClick={() => onContinue({ leverage: selectedLeverage, addons: selectedAddons, totalPrice })}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
        >
          Continue to Payment
        </button>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default ChallengeConfigPage;
