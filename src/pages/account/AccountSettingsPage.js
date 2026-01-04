import { ArrowLeft, Shield, Key, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const AccountSettingsPage = ({ onBack }) => {
  const { isDark, themeMode, setTheme } = useTheme();

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
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">Change</button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Smartphone className={isDark ? 'text-white/60' : 'text-gray-600'} size={20} />
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Add extra security to your account</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm">Enabled</button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Preferences</h2>
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
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default AccountSettingsPage;