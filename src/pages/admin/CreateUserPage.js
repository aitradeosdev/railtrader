import { useState } from 'react';
import { ArrowLeft, Save, User, DollarSign, Shield, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const CreateUserPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountBalance: 0,
    totalProfit: 0,
    totalLoss: 0,
    winRate: 0,
    isAdmin: false
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.accountBalance < 0) {
      newErrors.accountBalance = 'Account balance cannot be negative';
    }

    if (formData.winRate < 0 || formData.winRate > 100) {
      newErrors.winRate = 'Win rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('apiUrl('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the user with additional fields if needed
        if (formData.accountBalance > 0 || formData.totalProfit > 0 || formData.totalLoss > 0 || formData.winRate > 0 || formData.isAdmin) {
          await fetch(`apiUrl('/admin/users/${result.user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              accountBalance: formData.accountBalance,
              totalProfit: formData.totalProfit,
              totalLoss: formData.totalLoss,
              winRate: formData.winRate,
              isAdmin: formData.isAdmin
            })
          });
        }

        alert('User created successfully!');
        onBack();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} size={20} />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New User</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>Add a new user to the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-blue-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none ${errors.firstName ? 'ring-2 ring-red-500' : ''}`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none ${errors.lastName ? 'ring-2 ring-red-500' : ''}`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full p-3 pr-12 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        </GlassCard>

        {/* Financial Settings */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="text-emerald-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Financial Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Initial Account Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.accountBalance}
                onChange={(e) => handleInputChange('accountBalance', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none ${errors.accountBalance ? 'ring-2 ring-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.accountBalance && <p className="text-red-400 text-sm mt-1">{errors.accountBalance}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Initial Total Profit ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalProfit}
                onChange={(e) => handleInputChange('totalProfit', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Initial Total Loss ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalLoss}
                onChange={(e) => handleInputChange('totalLoss', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Initial Win Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.winRate}
                onChange={(e) => handleInputChange('winRate', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none ${errors.winRate ? 'ring-2 ring-red-500' : ''}`}
                placeholder="0.0"
              />
              {errors.winRate && <p className="text-red-400 text-sm mt-1">{errors.winRate}</p>}
            </div>

            {/* Net P&L Display */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-2`}>Net Profit/Loss</p>
              <p className={`text-xl font-bold ${formData.totalProfit - formData.totalLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${(formData.totalProfit - formData.totalLoss).toLocaleString()}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Account Permissions */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-purple-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Permissions</h2>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Administrator Access</h3>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Grant full administrative privileges to this user
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={(e) => handleInputChange('isAdmin', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
            <h4 className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`}>Important Notes:</h4>
            <ul className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'} space-y-1`}>
              <li>• The user will receive login credentials via email</li>
              <li>• They can enable 2FA from their account settings</li>
              <li>• Financial settings can be modified later</li>
              <li>• Admin privileges can be revoked at any time</li>
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className={`px-8 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </div>
  );
};

export default CreateUserPage;
