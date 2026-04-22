import React, { createContext, useState, useEffect } from 'react';
import api from './api';
import Cookies from 'js-cookie';

import { LoadingScreen } from './components/UI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const res = await api.get('/users/me');
        setUser(res.data.user);
      } catch (err) {
        Cookies.remove('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    Cookies.set('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (formData) => {
    // If formData is an object, it will be sent as JSON.
    // If it's a FormData instance, it will be sent as multipart/form-data.
    const res = await api.post('/auth/register', formData);
    Cookies.set('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, refreshUser: fetchUser }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
