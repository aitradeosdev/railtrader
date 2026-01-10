import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, DollarSign, TrendingUp, Shield, Smartphone, CheckCircle } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const EditUserPage = ({ onBack, userId }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    accountBalance: 0,
    totalProfit: 0,
    totalLoss: 0,
    winRate: 0,
    isAdmin: false,
    twoFactorEnabled: false
  });

  useEffect(() => {
    fetchUser();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await response.json();
      const foundUser = users.find(u => u._id === userId);
      if (foundUser) {
        setUser(foundUser);
        setFormData({
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          email: foundUser.email,
          accountBalance: foundUser.accountBalance,
          totalProfit: foundUser.totalProfit,
          totalLoss: foundUser.totalLoss,
          winRate: foundUser.winRate,
          isAdmin: foundUser.isAdmin,
          twoFactorEnabled: foundUser.twoFactorEnabled
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onBack();
        }, 2000);
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDark ? 'text-white/60' : 'text-gray-600'}`}>User not found</p>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl backdrop-blur-md ${
            isDark ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
          } shadow-lg`}>
            <CheckCircle className="text-emerald-500" size={24} />
            <div>
              <p className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                User Updated Successfully!
              </p>
              <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                Changes have been saved
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} size={20} />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit User</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>Modify user information and settings</p>
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
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-2`}>Member Since</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
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
                Account Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.accountBalance}
                onChange={(e) => handleInputChange('accountBalance', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Total Profit ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.totalProfit}
                onChange={(e) => handleInputChange('totalProfit', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Total Loss ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.totalLoss}
                onChange={(e) => handleInputChange('totalLoss', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Win Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.winRate}
                onChange={(e) => handleInputChange('winRate', parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
              />
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
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-purple-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Permissions</h2>
          </div>

          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Administrator Access</h3>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Grant full administrative privileges
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

            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</h3>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    {formData.twoFactorEnabled ? 'User has 2FA enabled' : 'User has not enabled 2FA'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  formData.twoFactorEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'} mt-2`}>
                Note: 2FA can only be managed by the user themselves
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Account Actions */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-orange-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Actions</h2>
          </div>

          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Mail size={20} />
                <div>
                  <p className="font-semibold">Send Email Notification</p>
                  <p className="text-sm text-blue-200">Notify user of account changes</p>
                </div>
              </div>
            </button>

            <button className="w-full px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Shield size={20} />
                <div>
                  <p className="font-semibold">Reset Password</p>
                  <p className="text-sm text-amber-200">Force password reset on next login</p>
                </div>
              </div>
            </button>

            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Smartphone size={20} />
                <div>
                  <p className="font-semibold">Reset 2FA</p>
                  <p className="text-sm text-purple-200">Disable and reset two-factor authentication</p>
                </div>
              </div>
            </button>

            <button className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-left">
              <div className="flex items-center gap-3">
                <User size={20} />
                <div>
                  <p className="font-semibold">Suspend Account</p>
                  <p className="text-sm text-red-200">Temporarily disable user access</p>
                </div>
              </div>
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Save Button */}
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
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditUserPage;