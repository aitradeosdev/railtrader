import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationPage = () => {
  const { isDark } = useTheme();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="text-emerald-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-400" size={20} />;
      case 'info': return <Info className="text-blue-400" size={20} />;
      default: return <Bell className="text-gray-400" size={20} />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
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
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
              <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border ${!notification.read ? 'ring-1 ring-blue-400/20' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm`}>{notification.title}</h3>
                      <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-sm mt-1`}>{notification.message}</p>
                      <p className={`${isDark ? 'text-white/40' : 'text-gray-400'} text-xs mt-2`}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                      <button 
                        className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification._id);
                        }}
                      >
                        <X size={16} className={`${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button 
              onClick={markAllAsRead}
              className={`px-6 py-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} font-medium text-sm transition-colors hover:opacity-80`}
            >
              Mark All as Read
            </button>
          </div>
        )}
      </GlassCard>
      
      <Footer />
    </div>
  );
};

export default NotificationPage;