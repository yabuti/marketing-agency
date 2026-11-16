import axios from 'axios';

const API = axios.create({ baseURL: '/api', timeout: 30000 });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Auth-Token'] = token;
    // Nginx strips Authorization header — also send as query param fallback
    const sep = config.url?.includes('?') ? '&' : '?';
    config.url = (config.url || '') + sep + 'token=' + encodeURIComponent(token);
  }
  return config;
});

// The backend answers 403 for BOTH "token is no longer valid" and
// "you don't own this record" (see requireAdminAuth/requireUserAuth).
// Only clear the session for the former, otherwise a permission error
// would silently log the admin out mid-task.
const AUTH_FAILURE_MESSAGES = [
  'access denied',
  'admin access required',
  'invalid or expired token',
  'invalid token',
  'not authenticated',
  'buyer access required',
];

const isAuthFailure = (status, data) => {
  if (status === 401) return true;
  if (status !== 403) return false;
  const msg = String(data?.message || '').toLowerCase();
  return AUTH_FAILURE_MESSAGES.some(m => msg.includes(m));
};

API.interceptors.response.use(
  res => res,
  err => {
    if (isAuthFailure(err.response?.status, err.response?.data)) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default API;
