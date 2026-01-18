import { ArrowLeft, Key, Smartphone, Monitor, Sun, Moon, Shield, Trash2, Type } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useFontSize } from '../../contexts/FontSizeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';
import { useState } from 'react';

const AccountSettingsPage = ({ onBack, onNavigate }) => {
  const { isDark, themeMode, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { user, token, refreshUser } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const disableTwoFactor = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/user/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await refreshUser(); // Refresh user data instead of page reload
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
    }
  };

  const deleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`${apiUrl()}/api/user/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
    setDeleteLoading(false);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Account Settings</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Security and preferences</p>
        </div>
      </div>

      {!user?.dateOfBirth && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-4">
          <strong>Profile Incomplete:</strong> Please set your date of birth in Personal Information to enable all features.
          <button 
            onClick={() => onNavigate('personalInfo')}
            className="ml-2 underline hover:no-underline"
          >
            Update now
          </button>
        </div>
      )}

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Appearance</h2>
        <div className="space-y-6">
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    themeMode === value
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`mx-auto mb-2 ${
                    themeMode === value
                      ? 'text-blue-500'
                      : isDark
                      ? 'text-white/60'
                      : 'text-gray-600'
                  }`} size={24} />
                  <p className={`text-sm font-medium ${
                    themeMode === value
                      ? 'text-blue-500'
                      : isDark
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}>{label}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Font Size</p>
            <div className="grid grid-cols-2 gap-3">
              {fontSizeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFontSize(value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fontSize === value
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Type className={`mx-auto mb-2 ${
                    fontSize === value
                      ? 'text-blue-500'
                      : isDark
                      ? 'text-white/60'
                      : 'text-gray-600'
                  }`} size={value === 'small' ? 20 : 24} />
                  <p className={`text-sm font-medium ${
                    fontSize === value
                      ? 'text-blue-500'
                      : isDark
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}>{label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Key className={isDark ? 'text-white/60' : 'text-gray-600'} size={20} />
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Password</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Update your account password</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('changePassword')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
            >
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Smartphone className={isDark ? 'text-white/60' : 'text-gray-600'} size={20} />
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Add extra security to your account</p>
              </div>
            </div>
            {user?.twoFactorEnabled ? (
              <button 
                onClick={disableTwoFactor}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm"
              >
                Disable
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('twoFactorSetup')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm"
              >
                Enable
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Shield className={isDark ? 'text-white/60' : 'text-gray-600'} size={20} />
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>KYC Verification</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Verify your identity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.kycStatus === 'verified' ? (
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                  Verified
                </span>
              ) : (
                <button 
                  onClick={() => onNavigate('kycVerification')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold text-red-400 mb-4`}>Danger Zone</h2>
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="text-red-400" size={20} />
              <div>
                <p className="font-semibold text-red-400">Delete Account</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Permanently delete your account and all data</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </GlassCard>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Delete Account</h3>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} mb-6`}>
              This action cannot be undone. This will permanently delete your account, KYC verification data, and remove all associated information.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 py-3 rounded-xl border ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-900 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button 
                onClick={deleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Logout Button */}
      <div className="lg:hidden">
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10 bg-red-500/5' : 'text-red-600 hover:bg-red-50 bg-red-50'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
          </svg>
          <div>
            <p className="font-semibold">Logout</p>
            <p className={`text-sm ${isDark ? 'text-red-400/60' : 'text-red-600/60'}`}>Sign out of your account</p>
          </div>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default AccountSettingsPage;