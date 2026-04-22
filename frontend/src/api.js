import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_URL || 'https://pet-shop-xa1r.onrender.com/api'
=======
  baseURL: import.meta.env.VITE_API_URL || 'https://pet-shop-xa1r.onrender.com'
>>>>>>> 18f6d0aa7dcb8c55223c17c07fcc7d6a8569d7b9
});

api.interceptors.request.use(config => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
