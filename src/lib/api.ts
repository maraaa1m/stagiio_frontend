import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Shared axios instance used by ALL components ───────────────────────────────
// Import this instead of bare `axios` everywhere to get auth + refresh for free.
const api = axios.create({
  baseURL: '/api',
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: refresh token on 401, redirect on failure ───────────
let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        if (original.headers) original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      isRefreshing = false;
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post('/api/auth/token/refresh/', { refresh });
      const newAccess: string = data.access;
      localStorage.setItem('access_token', newAccess);
      if (original.headers) original.headers.Authorization = `Bearer ${newAccess}`;
      processQueue(null, newAccess);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;