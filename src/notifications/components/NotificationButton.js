import React from 'react';
import { Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationButton = ({ onNotificationClick }) => {
  const { isDark } = useTheme();
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onNotificationClick}
      className={`relative p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-100 border-gray-200 text-gray-500'} border transition-colors`}
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;