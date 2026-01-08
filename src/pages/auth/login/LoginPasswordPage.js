import { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPasswordPage = ({ email, onLogin, onBack, onTwoFactorRequired }) => {
  const { isDark } = useTheme();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!password) return;
    
    setLoading(true);
    const result = await login({ email, password });
    
    if (result.success) {
      onLogin();
    } else if (result.requiresTwoFactor) {
      onTwoFactorRequired({ password });
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
          <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="mx-auto mb-4" />
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Enter Password</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Welcome back, {email}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 text-lg rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} /> : <Eye size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className={`ml-2 text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Remember me</span>
            </label>
            <button type="button" className="text-sm text-blue-400 hover:text-blue-300">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white rounded-2xl font-medium hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl shadow-blue-500/30 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPasswordPage;