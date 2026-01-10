import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const ChangePasswordPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { changePassword } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const result = await changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
    
    if (result.success) {
      setMessage('Password updated successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage(result.message || 'Failed to update password');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Change Password</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Update your account password</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl ${message.includes('success') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'} text-sm`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <GlassCard className="p-6">
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Current Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} /> : <Eye size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>New Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} /> : <Eye size={20} className={isDark ? 'text-white/40' : 'text-gray-400'} />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Confirm New Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Confirm new password"
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
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onBack}
              className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </GlassCard>
      </form>

      <Footer />
    </div>
  );
};

export default ChangePasswordPage;
