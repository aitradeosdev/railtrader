import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../notifications/contexts/NotificationContext';

const NotificationPreferencesPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { preferences, updatePreferences } = useNotifications();

  const notificationTypes = [
    { id: 'payouts', title: 'Payouts', description: 'Notifications about payout processing' },
    { id: 'challenges', title: 'Challenge Updates', description: 'Updates about your active challenges' },
    { id: 'kyc', title: 'KYC Updates', description: 'Identity verification status updates' },
    { id: 'account', title: 'Account Security', description: 'Login alerts and security notifications' },
    { id: 'marketing', title: 'Marketing', description: 'Promotional offers and updates' }
  ];

  const handleToggle = (type) => {
    updatePreferences({
      ...preferences,
      [type]: !preferences[type]
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Notification Preferences</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Manage how you receive notifications</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-left py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Notification Type</th>
                <th className={`text-center py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Enabled
                </th>
              </tr>
            </thead>
            <tbody>
              {notificationTypes.map((type) => (
                <tr key={type.id} className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  <td className="py-4">
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{type.title}</p>
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{type.description}</p>
                    </div>
                  </td>
                  <td className="text-center py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={preferences[type.id] || false}
                        onChange={() => handleToggle(type.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        

      </GlassCard>

      <Footer />
    </div>
  );
};

export default NotificationPreferencesPage;