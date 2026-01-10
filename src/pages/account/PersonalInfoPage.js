import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const PersonalInfoPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

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
                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </GlassCard>
      </form>

      <Footer />
    </div>
  );
};

export default PersonalInfoPage;
