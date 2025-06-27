import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});

api.interceptors.response.use(undefined, err => { 
  console.error('🔒 CORS/API error', err); 
  return Promise.reject(err); 
}); 