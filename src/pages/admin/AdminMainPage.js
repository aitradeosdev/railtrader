import { Settings, CreditCard } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';

const AdminMainPage = ({ onNavigate }) => {
  const { isDark } = useTheme();

  const adminSections = [
    {
      id: 'settings',
      title: 'Platform Settings',
      description: 'Configure platform settings and preferences',
      icon: Settings,
      color: 'text-orange-400'
    },
    {
      id: 'paystack',
      title: 'Paystack Settings',
      description: 'Configure payment gateway and credentials',
      icon: CreditCard,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Admin Panel</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Manage your RailTrader platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <GlassCard key={section.id} className="p-6 cursor-pointer hover:scale-[1.02] transition-transform">
              <button
                onClick={() => onNavigate(section.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <IconComponent className={section.color} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{section.title}</h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{section.description}</p>
                  </div>
                </div>
              </button>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMainPage;