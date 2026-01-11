import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CreditCard, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import SuccessNotification from '../../components/SuccessNotification';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const PaystackSettingsPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    paystack: {
      testMode: true,
      testPublicKey: '',
      testSecretKey: '',
      livePublicKey: '',
      liveSecretKey: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    testSecret: false,
    liveSecret: false
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/platform-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch(`${apiUrl()}/api/admin/platform-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePaystackChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      paystack: {
        ...prev.paystack,
        [key]: value
      }
    }));
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Paystack Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-emerald-400" size={24} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Test Mode</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Use test credentials for development</p>
                {settings.paystack?.testMode && (
                  <p className="text-xs text-amber-400 mt-1">⚠️ Currently using test mode</p>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paystack?.testMode || true}
                  onChange={(e) => handlePaystackChange('testMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 ${settings.paystack?.testMode ? 'bg-amber-500' : 'bg-emerald-500'} peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500`}></div>
              </label>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Test Credentials</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Test Public Key
              </label>
              <input
                type="text"
                value={settings.paystack?.testPublicKey || ''}
                onChange={(e) => handlePaystackChange('testPublicKey', e.target.value)}
                placeholder="pk_test_..."
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none font-mono text-sm`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Test Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets.testSecret ? "text" : "password"}
                  value={settings.paystack?.testSecretKey || ''}
                  onChange={(e) => handlePaystackChange('testSecretKey', e.target.value)}
                  placeholder="sk_test_..."
                  className={`w-full p-3 pr-12 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none font-mono text-sm`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('testSecret')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {showSecrets.testSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Credentials</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Live Public Key
              </label>
              <input
                type="text"
                value={settings.paystack?.livePublicKey || ''}
                onChange={(e) => handlePaystackChange('livePublicKey', e.target.value)}
                placeholder="pk_live_..."
                className={`w-full p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none font-mono text-sm`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Live Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets.liveSecret ? "text" : "password"}
                  value={settings.paystack?.liveSecretKey || ''}
                  onChange={(e) => handlePaystackChange('liveSecretKey', e.target.value)}
                  placeholder="sk_live_..."
                  className={`w-full p-3 pr-12 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none font-mono text-sm`}
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('liveSecret')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {showSecrets.liveSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Setup Guide</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium mb-2`}>How to get your Paystack keys:</p>
              <ol className={`${isDark ? 'text-blue-400/80' : 'text-blue-600/80'} space-y-1 list-decimal list-inside`}>
                <li>Login to your Paystack Dashboard</li>
                <li>Go to Settings → API Keys & Webhooks</li>
                <li>Copy your Public and Secret keys</li>
                <li>Use test keys for development</li>
                <li>Switch to live keys for production</li>
              </ol>
            </div>
            
            <div className={`p-3 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`${isDark ? 'text-amber-400' : 'text-amber-600'} font-medium mb-1`}>⚠️ Security Note:</p>
              <p className={`${isDark ? 'text-amber-400/80' : 'text-amber-600/80'}`}>Never share your secret keys. They are stored securely and encrypted.</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <SuccessNotification 
        message="Paystack settings saved successfully!"
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default PaystackSettingsPage;