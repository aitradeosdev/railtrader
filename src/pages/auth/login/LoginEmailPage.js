import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const LoginEmailPage = ({ onContinue, onSwitchToRegister }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      onContinue({ email });
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
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight size={20} />
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