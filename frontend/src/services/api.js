import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const baseURL = rawApiUrl 
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`) 
  : '/api';

// Create configured Axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clouddeploy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      if (!isAuthRoute) {
        localStorage.removeItem('clouddeploy_token');
        localStorage.removeItem('clouddeploy_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  scale: (id, replicas) => api.patch(`/applications/${id}/scale`, { replicas }),
  simulateFailure: (id) => api.post(`/applications/${id}/simulate-failure`),
  getDeployments: (id, params) => api.get(`/applications/${id}/deployments`, { params }),
  deploy: (id, options) => api.post(`/applications/${id}/deploy`, options)
};

export const deploymentsAPI = {
  getAll: (params) => api.get('/deployments', { params }),
  getById: (id) => api.get(`/deployments/${id}`),
  trigger: (data) => api.post('/deployments', data),
  cancel: (id) => api.post(`/deployments/${id}/cancel`),
  rollback: (id) => api.post(`/deployments/${id}/rollback`),
  getLogs: (id, params) => api.get(`/deployments/${id}/logs`, { params })
};

export const monitoringAPI = {
  getDashboard: () => api.get('/monitoring/dashboard'),
  getMetrics: () => api.get('/monitoring/metrics'),
  getHealth: () => api.get('/monitoring/health')
};

export const infrastructureAPI = {
  getDetails: () => api.get('/infrastructure'),
  getCluster: () => api.get('/infrastructure/cluster')
};

export default api;
