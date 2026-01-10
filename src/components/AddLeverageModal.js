import { useState } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '../UIComponents';
import { useTheme } from '../../contexts/ThemeContext';

const AddLeverageModal = ({ show, onClose, onAdd }) => {
  const { isDark } = useTheme();
  const [leverageValue, setLeverageValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (leverageValue.trim()) {
      onAdd(leverageValue.trim());
      setLeverageValue('');
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <GlassCard className="p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Add Leverage Option
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X size={20} className={isDark ? 'text-white/60' : 'text-gray-600'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Leverage Ratio
            </label>
            <input
              type="text"
              value={leverageValue}
              onChange={(e) => setLeverageValue(e.target.value)}
              placeholder="e.g., 1:500"
              className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              autoFocus
              required
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Enter in format like 1:30, 1:50, 1:100, etc.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default AddLeverageModal;