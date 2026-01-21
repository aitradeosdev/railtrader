import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  const getToastStyles = (type) => {
    const baseStyles = "p-4 rounded-lg shadow-lg border-l-4 flex items-center justify-between min-w-80 max-w-md";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} animate-slide-in`}
        >
          <div className="flex items-center">
            <span className="mr-2 text-lg">{getIcon(toast.type)}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-lg hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;