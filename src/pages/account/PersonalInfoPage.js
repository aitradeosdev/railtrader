import { ArrowLeft, Save } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalInfoPage = ({ onBack }) => {
  const { isDark } = useTheme();

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

      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>First Name</label>
            <input
              type="text"
              defaultValue="John"
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Last Name</label>
            <input
              type="text"
              defaultValue="Doe"
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Phone</label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Address</label>
            <input
              type="text"
              defaultValue="123 Main Street, City, State 12345"
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
        </div>
        <button className="flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">
          <Save size={16} />
          Save Changes
        </button>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default PersonalInfoPage;