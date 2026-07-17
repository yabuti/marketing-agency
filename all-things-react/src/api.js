import axios from 'axios';

const BASE = '/api';
const API = axios.create({ baseURL: BASE });

// Attach token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['X-Auth-Token'] = token;
    // Nginx strips Authorization header — also send as query param fallback
    const sep = config.url?.includes('?') ? '&' : '?';
    config.url = (config.url || '') + sep + 'token=' + encodeURIComponent(token);
  }
  return config;
});

// On 403, clear stale token and redirect to login
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 403) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
