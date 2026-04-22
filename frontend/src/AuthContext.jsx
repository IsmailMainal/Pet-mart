import React, { createContext, useState, useEffect } from 'react';
import api from './api';
import Cookies from 'js-cookie';

import { LoadingScreen } from './components/UI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const res = await api.get('/users/me');
          setUser(res.data.user);
        } catch (err) {
          Cookies.remove('token');
        }
      }
      // Artificial delay to show off the fun loading messages
      setTimeout(() => setLoading(false), 800);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    Cookies.set('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    Cookies.set('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
