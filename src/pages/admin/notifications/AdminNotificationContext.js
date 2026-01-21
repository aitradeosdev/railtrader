import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../../../utils/api';

const AdminNotificationContext = createContext();

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
};

export const AdminNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${apiUrl()}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl()}/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      // Handle error silently
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl()}/api/admin/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      // Handle error silently
    }
  };

  const removeNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl()}/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      // Handle error silently
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

  useEffect(() => {
    fetchNotifications();
    
    let eventSource = null;
    let reconnectTimer = null;
    
    const setupSSE = () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (eventSource) {
          eventSource.close();
        }
        
        eventSource = new EventSource(`${apiUrl()}/api/admin/notifications/stream?token=${token}`);
        
        eventSource.onopen = () => {
          // SSE connected
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== 'ping') {
              setNotifications(prev => [data, ...prev]);
              showToast(data.title, 'info');
            }
          } catch (error) {
            // Error parsing notification
          }
        };
        
        eventSource.onerror = (error) => {
          eventSource.close();
          reconnectTimer = setTimeout(setupSSE, 3000);
        };
      }
    };
    
    setupSSE();
    
    const handleFocus = () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      setupSSE();
      fetchNotifications();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        setupSSE();
        fetchNotifications();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    toasts,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    showToast,
    removeToast
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};