import { useState } from 'react';
import { ArrowLeft, Smartphone, Copy, Check } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const TwoFactorSetupPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const setupTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl()}/api/user/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep(2);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Network error');
    }
    setLoading(false);
  };

  const verifyTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl()}/api/user/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: verificationCode })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('2FA enabled successfully!');
        setStep(3);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Network error');
    }
    setLoading(false);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Two-Factor Authentication</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Secure your account with 2FA</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl ${message.includes('success') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'} text-sm`}>
          {message}
        </div>
      )}

      {step === 1 && (
        <GlassCard className="p-8 text-center">
          <Smartphone className={`mx-auto mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`} size={64} />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Enable Two-Factor Authentication</h2>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-6 leading-relaxed`}>
            Two-factor authentication adds an extra layer of security to your account. You'll need an authenticator app like Google Authenticator or Authy.
          </p>
          <button
            onClick={setupTwoFactor}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </button>
        </GlassCard>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Step 1: Scan QR Code</h2>
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white rounded-xl mb-4">
                <img src={qrCode} alt="QR Code" className="w-48 h-48 max-w-full" />
              </div>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Scan this QR code with your authenticator app
              </p>
            </div>
            
            <div className="mt-6">
              <p className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Or enter this code manually:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className={`flex-1 p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-100 border border-gray-200 text-gray-900'} font-mono text-xs sm:text-sm break-all`}>
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  className={`p-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} flex-shrink-0`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Step 2: Verify Setup</h2>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>
              Enter the 6-digit code from your authenticator app:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className={`flex-1 p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} text-center font-mono text-lg`}
              />
              <button
                onClick={verifyTwoFactor}
                disabled={loading || verificationCode.length !== 6}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {step === 3 && (
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-white" size={32} />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>2FA Enabled Successfully!</h2>
          <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} mb-6`}>
            Your account is now protected with two-factor authentication. You'll need to enter a code from your authenticator app when logging in.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
          >
            Done
          </button>
        </GlassCard>
      )}

      <Footer />
    </div>
  );
};

export default TwoFactorSetupPage;