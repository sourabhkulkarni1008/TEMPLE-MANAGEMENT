import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('temple_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('temple_token');
          setUser(null);
        }
      } catch (err) {
        console.warn('Session check failed:', err.message);
        localStorage.removeItem('temple_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password, requiredRole = null) => {
    const res = await api.post('/auth/login', { email, password, requiredRole });
    if (res.success && res.token) {
      localStorage.setItem('temple_token', res.token);
      setUser(res.user);
      return { user: res.user, requiresVerification: res.requiresVerification };
    }
    throw new Error(res.message || 'Login failed.');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem('temple_token', res.token);
      setUser(res.user);
      return { user: res.user, requiresVerification: true };
    }
    throw new Error(res.message || 'Registration failed.');
  };

  const sendOtp = async (email) => {
    const targetEmail = email || user?.email;
    const res = await api.post('/auth/send-otp', { email: targetEmail });
    return res;
  };

  const verifyOtp = async (code, email) => {
    const targetEmail = email || user?.email;
    const res = await api.post('/auth/verify-otp', { code, email: targetEmail });
    if (res.success) {
      setUser(prev => prev ? { ...prev, isVerified: true } : res.user);
      return res;
    }
    throw new Error(res.message || 'Verification failed.');
  };

  const logout = () => {
    localStorage.removeItem('temple_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sendOtp,
        verifyOtp,
        isAuthenticated: !!user,
        isEmailVerified: Boolean(user?.isVerified)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
