import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { GlassCard } from '../components/UIComponents';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

const NotificationPage = () => {
  const { isDark } = useTheme();
  
  const notifications = [
    { id: 1, type: 'success', title: 'Payout Processed', message: '$2,500 has been sent to your wallet', time: '2 min ago', read: false },
    { id: 2, type: 'info', title: 'New Challenge Available', message: '$250k Elite tier is now open', time: '1 hour ago', read: true }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="text-emerald-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-400" size={20} />;
      case 'info': return <Info className="text-blue-400" size={20} />;
      default: return <Bell className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Notifications</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Stay updated with your trading activity</p>
      </div>

      <GlassCard className="p-6 md:p-8">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`flex items-start gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border ${!notification.read ? 'ring-1 ring-blue-400/20' : ''}`}>
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm`}>{notification.title}</h3>
                    <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-sm mt-1`}>{notification.message}</p>
                    <p className={`${isDark ? 'text-white/40' : 'text-gray-400'} text-xs mt-2`}>{notification.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                    <button className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}>
                      <X size={16} className={`${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <button className={`px-6 py-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} font-medium text-sm transition-colors`}>
            Mark All as Read
          </button>
        </div>
      </GlassCard>
      
      <Footer />
    </div>
  );
};

export default NotificationPage;