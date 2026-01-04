import { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const RegisterPasswordPage = ({ basicInfo, onRegister, onBack }) => {
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    onRegister({ ...basicInfo, ...formData });
  };

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} flex items-center justify-center p-6`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[60%] ${isDark ? 'bg-blue-600/10' : 'bg-blue-600/5'} blur-[150px] rounded-full animate-pulse`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-purple-600/5' : 'bg-purple-600/3'} blur-[150px] rounded-full`} />
      </div>

      <div className={`relative z-10 w-full max-w-md p-8 rounded-[2rem] ${isDark ? 'bg-white/10' : 'bg-white/80'} backdrop-blur-2xl ${isDark ? 'border-white/20' : 'border-white/60'} border shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]`}>
        <div className="flex items-center mb-6">
          <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="text-center mb-8">
          <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="w-16 h-16 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Secure Your Account</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Create a strong password for {basicInfo.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Create password"
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
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded ${i < strength ? strengthColors[strength - 1] : (isDark ? 'bg-white/10' : 'bg-gray-200')}`} />
                  ))}
                </div>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Password strength: {strength > 0 ? strengthLabels[strength - 1] : 'Too weak'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Confirm Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} /> : <Eye size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">Passwords match</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5" 
              required 
            />
            <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              I agree to the <button type="button" className="text-blue-400 hover:text-blue-300">Terms of Service</button> and <button type="button" className="text-blue-400 hover:text-blue-300">Privacy Policy</button>
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPasswordPage;