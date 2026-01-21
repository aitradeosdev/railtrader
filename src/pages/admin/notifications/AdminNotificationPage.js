import React, { useState } from 'react';
import { Bell, ArrowLeft, Trash2, Eye } from 'lucide-react';
import { GlassCard } from '../../../components/UIComponents';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminNotifications } from './AdminNotificationContext';

const AdminNotificationPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useAdminNotifications();
  const [loading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <Bell className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>
            Admin Notifications
          </h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>
            System alerts and user activity notifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h2>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Mark All Read
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              No notifications yet
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                      : isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        notification.type === 'payout' ? 'bg-green-100 text-green-800' :
                        notification.type === 'challenge' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'kyc' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'user' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {notification.type}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Mark as read"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                    {notification.message}
                  </p>
                  <div className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminNotificationPage;