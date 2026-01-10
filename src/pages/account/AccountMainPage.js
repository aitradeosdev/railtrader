import { User, Shield, CreditCard, Settings, FileText, Bell } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const AccountMainPage = ({ onNavigate }) => {
  const { isDark } = useTheme();

  const accountSections = [
    { id: 'profile', title: 'Personal Info', description: 'Update your personal details', icon: User },
    { id: 'kyc', title: 'KYC Verification', description: 'Complete identity verification', icon: Shield },
    { id: 'payout', title: 'Payout Methods', description: 'Manage payout methods', icon: CreditCard },
    { id: 'settings', title: 'Account Settings', description: 'Security & preferences', icon: Settings },
    { id: 'documents', title: 'Certificates', description: 'Trading certificates & reports', icon: FileText },
    { id: 'notifications', title: 'Notifications', description: 'Manage notification preferences', icon: Bell }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Account</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountSections.map((section) => (
          <GlassCard key={section.id} className="p-6 cursor-pointer hover:scale-[1.02] transition-transform">
            <button
              onClick={() => onNavigate(section.id)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <section.icon className={`${isDark ? 'text-white' : 'text-gray-900'}`} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{section.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{section.description}</p>
                </div>
              </div>
            </button>
          </GlassCard>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default AccountMainPage;