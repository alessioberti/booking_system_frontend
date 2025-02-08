import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// definisci l'url base per le richieste
const api = axios.create({
  baseURL: 'https://localhost:10000/api/v1',
  withCredentials: true,
});


// intercetta le risposte per gestire errori 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    // se la richiesta era verso /refresh, esegui il logout
    if (originalRequest.url.includes('/refresh')) {
      authStore.logout();
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await authStore.refreshAccessToken();
          return api(originalRequest);
        } catch (refreshError) {
          // se il refresh fallisce, esegui il logout e propaga l'errore
          authStore.logout();
          return Promise.reject(refreshError);
        }
      } else {
        // se il retry è già stato effettuato, logout e propaga l'errore
        authStore.logout();
        return Promise.reject(error);
      }
    }

    // Per gli errori diversi da 401, non eseguire il logout, ma rifiuta l'errore
    return Promise.reject(error);
  }
);


export default api;
