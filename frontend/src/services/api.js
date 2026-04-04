import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on expired/invalid token
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/register', data),
  login:    (data) => API.post('/login', data)
};

export const policyAPI = {
  getPolicy:         ()     => API.get('/get-policy'),
  calculatePremium:  (plan) => API.post('/calculate-premium', { plan }),
  subscribe:         (plan) => API.post('/subscribe', { plan }),
  getRiskSnapshot:   ()     => API.get('/risk-snapshot')
};

export const payoutsAPI = {
  getPayouts: ()   => API.get('/payouts'),
  getSummary: ()   => API.get('/payouts/summary')
};

export const eventsAPI = {
  getEvents: (city) => API.get(`/events?city=${city}`)
};