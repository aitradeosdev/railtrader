import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../../utils/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [preferences, setPreferences] = useState({
    payouts: true,
    challenges: true,
    kyc: true,
    account: true,
    marketing: false
  });

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${apiUrl()}/api/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      // Silently fail until API is implemented
    }
  };

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${apiUrl()}/api/user/notification-preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      // Silently fail until API is implemented
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl()}/api/user/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPreferences)
      });
      setPreferences(newPreferences);
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to update preferences', 'error');
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl()}/api/user/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      // Failed to mark as read
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl()}/api/user/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      // Failed to mark all as read
    }
  };

  const removeNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl()}/api/user/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      // Failed to remove notification
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const notifySuccess = (message) => showToast(message, 'success');
  const notifyError = (message) => showToast(message, 'error');
  const notifyWarning = (message) => showToast(message, 'warning');
  const notifyInfo = (message) => showToast(message, 'info');

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    
    let eventSource = null;
    let reconnectTimer = null;
    
    const setupSSE = () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (eventSource) {
          eventSource.close();
        }
        
        eventSource = new EventSource(`${apiUrl()}/api/user/notifications/stream?token=${token}`);
        
        eventSource.onopen = () => {
          // SSE connected
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== 'ping') {
              setNotifications(prev => [data, ...prev]);
              showToast(data.title, data.type);
            }
          } catch (error) {
            // Error parsing notification
          }
        };
        
        eventSource.onerror = (error) => {
          eventSource.close();
          // Auto-reconnect after 3 seconds
          reconnectTimer = setTimeout(setupSSE, 3000);
        };
      }
    };
    
    // Initial SSE setup
    setupSSE();
    
    // Handle app focus/blur for PWA
    const handleFocus = () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      setupSSE();
      fetchNotifications();
    };
    
    const handleBlur = () => {
      // App blurred
    };
    
    // Handle visibility change for PWA
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        setupSSE();
        fetchNotifications();
      }
    };
    
    // Multiple event listeners for better PWA support
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    toasts,
    preferences,
    unreadCount,
    fetchNotifications,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    removeNotification,
    showToast,
    removeToast,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};