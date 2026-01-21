import React from 'react';
import { Bell } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminNotifications } from './AdminNotificationContext';

const AdminNotificationButton = ({ onClick }) => {
  const { isDark } = useTheme();
  const { unreadCount } = useAdminNotifications();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-xl transition-colors ${
        isDark 
          ? 'bg-white/10 hover:bg-white/20 text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
      }`}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default AdminNotificationButton;