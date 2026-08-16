import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://craftly-api.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('craftly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
