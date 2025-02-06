import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// definisci l'url base per le richieste
const api = axios.create({
  baseURL: 'https://localhost:10000/api/v1',
  withCredentials: true,
});


// Intercetta le risposte per gestire errori 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    try{
      // Se la richiesta era verso refresh esegue il logout
      if (originalRequest.url.includes('/refresh') ){
        authStore.logout();
        return Promise.reject(error);
      }
      // Se la richiesta era verso un altro url prova a richiedere un nuovo token altrimenti esegue il logout
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        await authStore.refreshAccessToken();
        return api(originalRequest);
      }
      else {
        authStore.logout();
        return Promise.reject(error);
      }
    } catch (err) {
      authStore.logout();
      return Promise.reject(err);
    }
  }
);

export default api;
