import { ArrowLeft, Key, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const AccountSettingsPage = ({ onBack, onNavigate }) => {
  const { isDark, themeMode, setTheme } = useTheme();
  const { user, token } = useAuth();

  const disableTwoFactor = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        window.location.reload(); // Refresh to update user data
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
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

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Appearance</h2>
        <div className="space-y-4">
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
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Account</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Email Notifications</p>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Receive trading alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {/* Mobile Logout Button */}
          <div className="lg:hidden pt-4 border-t border-white/10">
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
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default AccountSettingsPage;