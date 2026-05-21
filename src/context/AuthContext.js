import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user on mount
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.data);
    } catch (err) {
      // Token might be expired
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.login(email, password);
      const { token: newToken, refreshToken: newRefreshToken, user: newUser } = response.data;

      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);

      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (memberData) => {
    try {
      setError(null);
      const response = await api.register(memberData);
      const { token: newToken, refreshToken: newRefreshToken, user: newUser } = response.data;

      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);

      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }

    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
