import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const PersonalInfoPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { user, updateProfile, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
  });

  // Auto-refresh user data when component mounts and periodically
  useEffect(() => {
    const refreshData = async () => {
      await refreshUser();
    };
    
    // Initial refresh
    refreshData();
    
    // Set up interval for periodic refresh (every 30 seconds)
    const interval = setInterval(refreshData, 30000);
    
    return () => clearInterval(interval);
  }, [refreshUser]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
    } else {
      setMessage(result.message || 'Failed to update profile');
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
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Personal Information</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Update your personal details</p>
        </div>
      </div>

      {!user?.dateOfBirth && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-4">
          <strong>Action Required:</strong> Please set your date of birth to complete your profile and enable KYC verification.
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-xl ${message.includes('success') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'} text-sm mb-4`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={user?.kycStatus === 'verified' || user?.isSuspended}
                className={`w-full p-3 rounded-xl border ${user?.kycStatus === 'verified' || user?.isSuspended ? (isDark ? 'bg-white/5 border-white/10 text-white/60 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed') : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900')}`}
                required
              />
              {user?.kycStatus === 'verified' && (
                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Cannot be changed after KYC verification</p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={user?.kycStatus === 'verified' || user?.isSuspended}
                className={`w-full p-3 rounded-xl border ${user?.kycStatus === 'verified' || user?.isSuspended ? (isDark ? 'bg-white/5 border-white/10 text-white/60 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed') : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900')}`}
                required
              />
              {user?.kycStatus === 'verified' && (
                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Cannot be changed after KYC verification</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={user?.kycStatus === 'verified' || user?.isSuspended}
                className={`w-full p-3 rounded-xl border ${user?.kycStatus === 'verified' || user?.isSuspended ? (isDark ? 'bg-white/5 border-white/10 text-white/60 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed') : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900')}`}
              />
              {user?.kycStatus === 'verified' && (
                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Cannot be changed after KYC verification</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-gray-100 border-gray-200 text-gray-600'} cursor-not-allowed`}
                readOnly
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Email cannot be changed</p>
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading || user?.kycStatus === 'verified' || user?.isSuspended}
            className={`flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-medium ${user?.kycStatus === 'verified' || user?.isSuspended ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save size={16} />
            {user?.isSuspended ? 'Account Suspended' : user?.kycStatus === 'verified' ? 'Profile Locked' : (loading ? 'Saving...' : 'Save Changes')}
          </button>
          {user?.kycStatus === 'verified' && (
            <p className={`text-xs mt-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              Personal information is locked after KYC verification for security purposes.
            </p>
          )}
        </GlassCard>
      </form>

      <Footer />
    </div>
  );
};

export default PersonalInfoPage;