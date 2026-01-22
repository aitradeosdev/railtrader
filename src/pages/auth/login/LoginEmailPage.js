import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiUrl } from '../../../utils/api';

const LoginEmailPage = ({ onContinue, onSwitchToRegister }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${apiUrl()}/api/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.status === 429) {
        setError(data.message);
      } else if (data.exists) {
        onContinue({ email });
      } else {
        setError('No account found with this email address.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} flex items-center justify-center p-6`} style={{backgroundImage: `url(${isDark ? '/5523744-dark.jpg' : '/5523744.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>


      <div className={`relative z-10 w-full max-w-md p-8 rounded-[2rem] ${isDark ? 'bg-white/10' : 'bg-white/80'} backdrop-blur-2xl ${isDark ? 'border-white/20' : 'border-white/60'} border shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]`}>
        <div className="text-center mb-8">
          <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="mx-auto mb-4" />
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Welcome Back</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Enter your email to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 text-lg rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white rounded-2xl font-medium hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/30 border border-white/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Continue
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginEmailPage;