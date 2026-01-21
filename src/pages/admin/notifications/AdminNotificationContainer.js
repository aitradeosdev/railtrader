import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminNotifications } from './AdminNotificationContext';

const AdminNotificationContainer = () => {
  const { isDark } = useTheme();
  const { toasts, removeToast } = useAdminNotifications();

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getToastColors = (type) => {
    switch (type) {
      case 'success':
        return isDark 
          ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
          : 'bg-blue-50 border-blue-200 text-blue-700';
      case 'error':
        return isDark 
          ? 'bg-red-500/20 border-red-500/30 text-red-400' 
          : 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return isDark 
          ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' 
          : 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return isDark 
          ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
          : 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl shadow-lg backdrop-blur-xl border animate-in slide-in-from-top-2 ${getToastColors(toast.type)}`}
        >
          <div className="flex items-center gap-3">
            {getToastIcon(toast.type)}
            <span className="font-medium text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminNotificationContainer;