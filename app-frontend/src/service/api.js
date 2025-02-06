// src/composables/useApi.js
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Crea un'istanza di axios
const api = axios.create({
  baseURL: 'https://localhost:10000/api/v1',
  withCredentials: true,
});

// Intercetta le richieste per aggiungere il token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercetta le risposte per gestire errori 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    // Se il server risponde con 401 prova a fare il refresh del token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await authStore.refreshAccessToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {

        // Se il refresh fallisce, esegui il logout
        authStore.logout();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
