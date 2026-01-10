import { useState } from 'react';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

const TwoFactorVerifyPage = ({ email, password, onBack, onSuccess }) => {
  const { isDark } = useTheme();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    setLoading(true);
    const result = await login({ email, password, twoFactorCode: code });
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} flex items-center justify-center p-6`} style={{backgroundImage: `url(${isDark ? '/5523744-dark.jpg' : '/5523744.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className={`relative z-10 w-full max-w-md p-8 rounded-[2rem] ${isDark ? 'bg-white/10' : 'bg-white/80'} backdrop-blur-2xl ${isDark ? 'border-white/20' : 'border-white/60'} border shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]`}>
        <div className="flex items-center mb-6">
          <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="text-center mb-8">
          <Smartphone className={`mx-auto mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`} size={48} />
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Two-Factor Authentication</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Enter the 6-digit code from your authenticator app</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={`w-full p-4 text-2xl text-center rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest`}
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white rounded-2xl font-medium hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl shadow-blue-500/30 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Can't access your authenticator app?{' '}
            <button className="text-blue-400 hover:text-blue-300">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerifyPage;
