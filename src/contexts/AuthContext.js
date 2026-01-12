import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserWithToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserWithToken = async (authToken) => {
    try {
      const response = await fetch(`${apiUrl()}/api/user`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    return fetchUserWithToken(token);
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${apiUrl()}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message,
          registrationDisabled: data.registrationDisabled,
          maintenanceMode: data.maintenanceMode
        };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${apiUrl()}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresTwoFactor) {
          return { success: false, requiresTwoFactor: true };
        }
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message,
          maintenanceMode: data.maintenanceMode
        };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    refreshUser: fetchUser, // Add refresh function
    updateProfile: async (profileData) => {
      try {
        const response = await fetch(`${apiUrl()}/api/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data);
          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      } catch (error) {
        return { success: false, message: 'Network error' };
      }
    },
    changePassword: async (passwordData) => {
      try {
        const response = await fetch(`${apiUrl()}/api/user/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(passwordData)
        });

        const data = await response.json();

        if (response.ok) {
          return { success: true, message: data.message };
        } else {
          return { success: false, message: data.message };
        }
      } catch (error) {
        return { success: false, message: 'Network error' };
      }
    },
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};